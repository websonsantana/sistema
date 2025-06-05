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

export function ReceiptsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);

  const receipts = useQuery(api.receipts.list, { 
    status: statusFilter || undefined,
    paymentMethod: paymentMethodFilter || undefined
  });
  const clients = useQuery(api.clients.list, {});
  const employees = useQuery(api.employees.list, {});
  const quotes = useQuery(api.quotes.list, {});
  
  const createReceipt = useMutation(api.receipts.create);
  const updateReceipt = useMutation(api.receipts.update);
  const deleteReceipt = useMutation(api.receipts.remove);

  const [formData, setFormData] = useState({
    quoteId: "",
    clientId: "",
    employeeId: "",
    description: "",
    amount: 0,
    paymentMethod: "cash",
    status: "pending",
    dueDate: "",
    paidAt: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        quoteId: formData.quoteId ? formData.quoteId as any : undefined,
        clientId: formData.clientId as any,
        employeeId: formData.employeeId as any,
        paidAt: formData.paidAt || undefined,
      };

      if (editingReceipt) {
        await updateReceipt({ 
          id: editingReceipt._id, 
          ...submitData
        });
        toast.success("Recibo atualizado com sucesso!");
      } else {
        await createReceipt(submitData);
        toast.success("Recibo criado com sucesso!");
      }
      
      setIsModalOpen(false);
      setEditingReceipt(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar recibo");
    }
  };

  const resetForm = () => {
    setFormData({
      quoteId: "",
      clientId: "",
      employeeId: "",
      description: "",
      amount: 0,
      paymentMethod: "cash",
      status: "pending",
      dueDate: "",
      paidAt: "",
      notes: "",
    });
  };

  const handleEdit = (receipt: any) => {
    setEditingReceipt(receipt);
    setFormData({
      quoteId: receipt.quoteId || "",
      clientId: receipt.clientId,
      employeeId: receipt.employeeId,
      description: receipt.description,
      amount: receipt.amount,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      dueDate: receipt.dueDate,
      paidAt: receipt.paidAt || "",
      notes: receipt.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este recibo?")) {
      try {
        await deleteReceipt({ id: id as any });
        toast.success("Recibo excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir recibo");
      }
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
      key: "amount", 
      label: "Valor",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
    },
    { 
      key: "paymentMethod", 
      label: "Pagamento",
      render: (value: string) => {
        const labels = {
          cash: "Dinheiro",
          card: "Cartão",
          transfer: "Transferência",
          pix: "PIX"
        };
        return labels[value as keyof typeof labels] || value;
      }
    },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => {
        const colors = {
          paid: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          cancelled: "bg-red-100 text-red-800"
        };
        const labels = {
          paid: "Pago",
          pending: "Pendente",
          cancelled: "Cancelado"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {labels[value as keyof typeof labels]}
          </span>
        );
      }
    },
    { 
      key: "dueDate", 
      label: "Vencimento",
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
          <h1 className="text-3xl font-bold text-gray-900">Recibos</h1>
          <p className="text-gray-600">Gerencie seus recibos e pagamentos</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Recibo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todos os status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="cancelled">Cancelado</option>
        </Select>
        <Select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todos os métodos</option>
          <option value="cash">Dinheiro</option>
          <option value="card">Cartão</option>
          <option value="transfer">Transferência</option>
          <option value="pix">PIX</option>
        </Select>
      </div>

      <DataTable
        data={receipts || []}
        columns={columns}
        loading={receipts === undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReceipt(null);
          resetForm();
        }}
        title={editingReceipt ? "Editar Recibo" : "Novo Recibo"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Orçamento (opcional)"
              value={formData.quoteId}
              onChange={(e) => setFormData({ ...formData, quoteId: e.target.value })}
            >
              <option value="">Nenhum orçamento</option>
              {quotes?.map((quote) => (
                <option key={quote._id} value={quote._id}>
                  {quote.client?.name} - R$ {quote.totalAmount.toLocaleString('pt-BR')}
                </option>
              ))}
            </Select>
            
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

            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Método de Pagamento"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            >
              <option value="cash">Dinheiro</option>
              <option value="card">Cartão</option>
              <option value="transfer">Transferência</option>
              <option value="pix">PIX</option>
            </Select>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="cancelled">Cancelado</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data de Vencimento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />

            {formData.status === "paid" && (
              <Input
                label="Data de Pagamento"
                type="date"
                value={formData.paidAt}
                onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
              />
            )}
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
              {editingReceipt ? "Atualizar" : "Criar"} Recibo
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
