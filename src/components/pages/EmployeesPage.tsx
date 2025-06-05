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

export function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const employees = useQuery(api.employees.list, { 
    search: searchTerm || undefined,
    department: departmentFilter || undefined 
  });
  const createEmployee = useMutation(api.employees.create);
  const updateEmployee = useMutation(api.employees.update);
  const deleteEmployee = useMutation(api.employees.remove);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: 0,
    hireDate: "",
    status: "active",
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        await updateEmployee({ id: editingEmployee._id, ...formData });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await createEmployee(formData);
        toast.success("Funcionário criado com sucesso!");
      }
      
      setIsModalOpen(false);
      setEditingEmployee(null);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      salary: 0,
      hireDate: "",
      status: "active",
      skills: [],
    });
    setSkillInput("");
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hireDate: employee.hireDate,
      status: employee.status,
      skills: employee.skills || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteEmployee({ id: id as any });
        toast.success("Funcionário excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir funcionário");
      }
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const columns = [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email" },
    { key: "position", label: "Cargo" },
    { key: "department", label: "Departamento" },
    { 
      key: "salary", 
      label: "Salário",
      render: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`
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
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600">Gerencie seus funcionários</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="sm:max-w-xs"
        >
          <option value="">Todos os departamentos</option>
          <option value="Técnico">Técnico</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Vendas">Vendas</option>
          <option value="Suporte">Suporte</option>
        </Select>
      </div>

      <DataTable
        data={employees || []}
        columns={columns}
        loading={employees === undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
          resetForm();
        }}
        title={editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
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
              label="Cargo"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
            <Select
              label="Departamento"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Selecione um departamento</option>
              <option value="Técnico">Técnico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Vendas">Vendas</option>
              <option value="Suporte">Suporte</option>
            </Select>
            <Input
              label="Salário (R$)"
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Data de Contratação"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Habilidades
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar habilidade..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
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
              {editingEmployee ? "Atualizar" : "Criar"} Funcionário
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
