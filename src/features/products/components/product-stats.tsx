import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Product } from '../types';
import { calculateProductStats, formatCurrency } from '../utils/productUtils';

interface ProductStatsProps {
  products: Product[];
  className?: string;
}

export function ProductStats({ products, className }: ProductStatsProps) {
  const stats = calculateProductStats(products);

  const statsCards = [
    {
      title: 'Total de productos',
      value: stats.total.toString(),
      icon: Package,
      description: `${stats.active} activos • ${stats.inactive} inactivos`,
      trend: stats.active > stats.inactive ? 'up' : stats.active < stats.inactive ? 'down' : 'neutral',
      color: 'blue',
    },
    {
      title: 'Valor del inventario',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      description: `Promedio: ${formatCurrency(stats.averagePrice)}`,
      trend: 'neutral',
      color: 'green',
    },
    {
      title: 'Alertas de stock',
      value: (stats.outOfStock + stats.lowStock).toString(),
      icon: AlertTriangle,
      description: `${stats.outOfStock} sin stock • ${stats.lowStock} stock bajo`,
      trend: stats.outOfStock > 0 ? 'down' : stats.lowStock > 0 ? 'warning' : 'up',
      color: stats.outOfStock > 0 ? 'red' : stats.lowStock > 0 ? 'yellow' : 'green',
    },
    {
      title: 'Margen promedio',
      value: `${stats.averageMargin.toFixed(1)}%`,
      icon: Percent,
      description: getMarginDescription(stats.averageMargin),
      trend: stats.averageMargin >= 30 ? 'up' : stats.averageMargin >= 15 ? 'warning' : 'down',
      color: stats.averageMargin >= 30 ? 'green' : stats.averageMargin >= 15 ? 'yellow' : 'red',
    },
  ];

  function getMarginDescription(margin: number) {
    if (margin >= 30) return 'Excelente margen';
    if (margin >= 15) return 'Buen margen';
    return 'Margen bajo';
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  }

  function getColorClasses(color: string) {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  }

  if (products.length === 0) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center h-24">
                <p className="text-sm text-muted-foreground">Sin datos</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stockHealthPercentage = stats.total > 0 
    ? ((stats.total - stats.outOfStock - stats.lowStock) / stats.total) * 100 
    : 0;

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${getColorClasses(stat.color)}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTrendIcon(stat.trend)}
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de salud del inventario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Salud del inventario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estado general del stock</span>
              <span className="font-medium">{stockHealthPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={stockHealthPercentage} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">En stock</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {stats.total - stats.outOfStock - stats.lowStock}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Productos con stock suficiente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Stock bajo</span>
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      {stats.lowStock}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Productos por debajo del inventario mínimo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Sin stock</span>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {stats.outOfStock}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Productos agotados</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Alertas */}
          {(stats.outOfStock > 0 || stats.lowStock > 0) && (
            <div className="mt-4 space-y-2">
              {stats.outOfStock > 0 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">
                    {stats.outOfStock} producto{stats.outOfStock !== 1 ? 's' : ''} sin stock
                  </span>
                </div>
              )}
              
              {stats.lowStock > 0 && (
                <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    {stats.lowStock} producto{stats.lowStock !== 1 ? 's' : ''} con stock bajo
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
