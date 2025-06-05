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

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const clients = useQuery(api.clients.list, { 
    search: searchTerm || undefined,
    status: statusFilter || undefined 
  });
  const createClient = useMutation(api.clients.create);
  const updateClient = useMutation(api.clients.update);
  const deleteClient = useMutation(api.clients.remove);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    cpfCnpj: "",
    status: "active",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        await updateClient({ id: editingClient._id, ...formData });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createClient(formData);
        toast.success("Cliente criado com sucesso!");
      }
      
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zipCode: "",
        cpfCnpj: "",
        status: "active",
        notes: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      city: client.city,
      zipCode: client.zipCode,
      cpfCnpj: client.cpfCnpj,
      status: client.status,
      notes: client.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient({ id: id as any });
        toast.success("Cliente excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir cliente");
      }
    }
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telefone" },
    { key: "city", label: "Cidade" },
    { 
      key: "status", 
      label: "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "active" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {value === "active" ? "Ativo" : "Inativo"}
        </span>
      )
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie seus clientes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </div>

      <DataTable
        data={clients || []}
        columns={columns}
        loading={clients === undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
          setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            zipCode: "",
            cpfCnpj: "",
            status: "active",
            notes: "",
          });
        }}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="CPF/CNPJ"
              value={formData.cpfCnpj}
              onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
              required
            />
            <Input
              label="CEP"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              required
            />
            <Input
              label="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          
          <Input
            label="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
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
              {editingClient ? "Atualizar" : "Criar"} Cliente
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
