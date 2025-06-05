import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "../ui/DataTable";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

export function QuotesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);

  const quotes = useQuery(api.quotes.list, { 
    status: statusFilter || undefined 
  });
  const clients = useQuery(api.clients.list, {});
  const employees = useQuery(api.employees.list, {});
  const services = useQuery(api.services.list, {});
  
  const createQuote = useMutation(api.quotes.create);
  const updateQuote = useMutation(api.quotes.update);
  const deleteQuote = useMutation(api.quotes.remove);

  const [formData, setFormData] = useState({
    clientId: "",
    serviceIds: [] as string[],
    employeeId: "",
    description: "",
    totalAmount: 0,
    status: "pending",
    validUntil: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingQuote) {
        await updateQuote({ 
          id: editingQuote._id, 
          ...formData,
          clientId: formData.clientId as any,
          employeeId: formData.employeeId as any,
          serviceIds: formData.serviceIds as any
        });
        toast.success("Orçamento atualizado com sucesso!");
      } else {
        await createQuote({
          ...formData,
          clientId: formData.clientId as any,
          employeeId: formData.employeeId as any,
          serviceIds: formData.serviceIds as any
        });
        toast.success("Orçamento criado com sucesso!");
      }
      
      setIsModalOpen(false);
      setEditingQuote(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      serviceIds: [],
      employeeId: "",
      description: "",
      totalAmount: 0,
      status: "pending",
      validUntil: "",
      notes: "",
    });
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    setFormData({
      clientId: quote.clientId,
      serviceIds: quote.serviceIds,
      employeeId: quote.employeeId,
      description: quote.description,
      totalAmount: quote.totalAmount,
      status: quote.status,
      validUntil: quote.validUntil,
      notes: quote.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      try {
        await deleteQuote({ id: id as any });
        toast.success("Orçamento excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir orçamento");
      }
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    const newServiceIds = formData.serviceIds.includes(serviceId)
      ? formData.serviceIds.filter(id => id !== serviceId)
      : [...formData.serviceIds, serviceId];
    
    setFormData({ ...formData, serviceIds: newServiceIds });
    
    // Calculate total amount
    if (services) {
      const total = newServiceIds.reduce((sum, id) => {
        const service = services.find(s => s._id === id);
        return sum + (service?.price || 0);
      }, 0);
      setFormData(prev => ({ ...prev, totalAmount: total }));
    }
  };

  const columns = [
    { 
      key: "client", 
      label: "Cliente",
      render: (value: any) => value?.name || "N/A"
    },
    { 
      key: "employee", 
      label: "Funcionário",
      render: (value: any) => value?.name || "N/A"
    },
    { 
      key: "totalAmount", 
      label: "Valor",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => {
        const colors = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          rejected: "bg-red-100 text-red-800",
          expired: "bg-gray-100 text-gray-800"
        };
        const labels = {
          pending: "Pendente",
          approved: "Aprovado",
          rejected: "Rejeitado",
          expired: "Expirado"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {labels[value as keyof typeof labels]}
          </span>
        );
      }
    },
    { 
      key: "validUntil", 
      label: "Válido até",
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: "actions",
      label: "Ações",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie seus orçamentos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
          <option value="expired">Expirado</option>
        </Select>
      </div>

      <DataTable
        data={quotes || []}
        columns={columns}
        loading={quotes === undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuote(null);
          resetForm();
        }}
        title={editingQuote ? "Editar Orçamento" : "Novo Orçamento"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients?.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </Select>
            
            <Select
              label="Funcionário"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            >
              <option value="">Selecione um funcionário</option>
              {employees?.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serviços
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {services?.map((service) => (
                <label key={service._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.serviceIds.includes(service._id)}
                    onChange={() => handleServiceToggle(service._id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm">
                    {service.name} - R$ {service.price.toLocaleString('pt-BR')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valor Total (R$)"
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Válido até"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="expired">Expirado</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingQuote ? "Atualizar" : "Criar"} Orçamento
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
