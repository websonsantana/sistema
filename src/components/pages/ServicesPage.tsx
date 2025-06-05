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

export function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const services = useQuery(api.services.list, { 
    search: searchTerm || undefined,
    category: categoryFilter || undefined 
  });
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);
  const deleteService = useMutation(api.services.remove);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: 0,
    duration: 0,
    status: "active",
    materials: [] as string[],
  });

  const [materialInput, setMaterialInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await updateService({ id: editingService._id, ...formData });
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await createService(formData);
        toast.success("Serviço criado com sucesso!");
      }
      
      setIsModalOpen(false);
      setEditingService(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar serviço");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      duration: 0,
      status: "active",
      materials: [],
    });
    setMaterialInput("");
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      duration: service.duration,
      status: service.status,
      materials: service.materials || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteService({ id: id as any });
        toast.success("Serviço excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir serviço");
      }
    }
  };

  const addMaterial = () => {
    if (materialInput.trim() && !formData.materials.includes(materialInput.trim())) {
      setFormData({
        ...formData,
        materials: [...formData.materials, materialInput.trim()]
      });
      setMaterialInput("");
    }
  };

  const removeMaterial = (material: string) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m !== material)
    });
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "category", label: "Categoria" },
    { 
      key: "price", 
      label: "Preço",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
    },
    { 
      key: "duration", 
      label: "Duração",
      render: (value: number) => `${value}h`
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-600">Gerencie seus serviços</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todas as categorias</option>
          <option value="Manutenção">Manutenção</option>
          <option value="Instalação">Instalação</option>
          <option value="Reparo">Reparo</option>
          <option value="Consultoria">Consultoria</option>
        </Select>
      </div>

      <DataTable
        data={services || []}
        columns={columns}
        loading={services === undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
          resetForm();
        }}
        title={editingService ? "Editar Serviço" : "Novo Serviço"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Manutenção">Manutenção</option>
              <option value="Instalação">Instalação</option>
              <option value="Reparo">Reparo</option>
              <option value="Consultoria">Consultoria</option>
            </Select>
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Duração (horas)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
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
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materiais
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar material..."
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
              />
              <Button type="button" onClick={addMaterial}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.materials.map((material, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {material}
                  <button
                    type="button"
                    onClick={() => removeMaterial(material)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingService ? "Atualizar" : "Criar"} Serviço
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
