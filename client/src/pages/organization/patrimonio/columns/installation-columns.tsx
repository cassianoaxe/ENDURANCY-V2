import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definição do tipo de instalação
export type Installation = {
  id: number;
  name: string;
  type: string;
  status: string;
  address: string;
  city: string;
  state: string;
  totalArea?: number;
  capacity?: number;
  occupancyRate?: number;
};

export const columns: ColumnDef<Installation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar tudo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => <div>{row.getValue("type")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "ativo"
              ? "success"
              : status === "em_manutenção"
              ? "warning"
              : status === "inativo"
              ? "secondary"
              : "destructive"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Endereço",
    cell: ({ row }) => <div>{row.getValue("address")}</div>,
  },
  {
    accessorKey: "city",
    header: "Cidade",
    cell: ({ row }) => <div>{row.getValue("city")}</div>,
  },
  {
    accessorKey: "state",
    header: "Estado",
    cell: ({ row }) => <div>{row.getValue("state")}</div>,
  },
  {
    accessorKey: "totalArea",
    header: "Área (m²)",
    cell: ({ row }) => (
      <div>
        {row.getValue("totalArea")
          ? `${row.getValue("totalArea")} m²`
          : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const installation = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/instalacoes/${installation.id}/ativos`}>
                Visualizar ativos
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];