import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Eye, Edit, Clock, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definição do tipo de ativo
export type Asset = {
  id: number;
  name: string;
  description?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  type: string;
  status: string;
  acquisitionDate?: string;
  acquisitionValue?: number;
  currentValue?: number;
  installationId?: number;
  installationName?: string;
  usefulLifeYears?: number;
  depreciationRate?: number;
  depreciationMethod?: string;
};

export const columns: ColumnDef<Asset>[] = [
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
    accessorKey: "serialNumber",
    header: "Nº Série",
    cell: ({ row }) => (
      <div>{row.getValue("serialNumber") || "N/A"}</div>
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
    accessorKey: "installationName",
    header: "Instalação",
    cell: ({ row }) => (
      <div>{row.getValue("installationName") || "Não alocado"}</div>
    ),
  },
  {
    accessorKey: "acquisitionValue",
    header: "Valor (R$)",
    cell: ({ row }) => {
      const value = row.getValue("acquisitionValue") as number;
      return (
        <div>
          {value
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value)
            : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "currentValue",
    header: "Valor Atual (R$)",
    cell: ({ row }) => {
      const value = row.getValue("currentValue") as number;
      return (
        <div>
          {value
            ? new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value)
            : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asset = row.original;

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
              <Link to={`/organization/patrimonio/ativos/${asset.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/ativos/${asset.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/ativos/${asset.id}/manutencoes`}>
                <Clock className="mr-2 h-4 w-4" /> Histórico de manutenções
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/organization/patrimonio/ativos/${asset.id}/depreciacao`}>
                Calcular depreciação
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];