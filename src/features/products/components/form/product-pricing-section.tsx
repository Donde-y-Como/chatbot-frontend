import { Control, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp } from 'lucide-react';
import { CreateProductForm } from '../../types';

interface ProductPricingSectionProps {
  control: Control<CreateProductForm>;
}

export function ProductPricingSection({ control }: ProductPricingSectionProps) {
  // Observar los valores para calcular métricas en tiempo real
  const price = useWatch({ control, name: 'price' }) || 0;
  const cost = useWatch({ control, name: 'cost' }) || 0;
  const discount = useWatch({ control, name: 'discount' }) || 0;
  const taxes = useWatch({ control, name: 'taxes' }) || 0;

  // Cálculos
  const finalPrice = price * (1 - discount / 100);
  const priceWithTaxes = finalPrice * (1 + taxes / 100);
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const profit = price - cost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getMarginColor = (marginPercent: number) => {
    if (marginPercent >= 30) return 'bg-green-100 text-green-800 border-green-200';
    if (marginPercent >= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Precios y Costos
          <span className="text-sm font-normal text-muted-foreground">
            (Campos obligatorios)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Costo */}
          <FormField
            control={control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo del producto *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Costo unitario de producción o compra
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Precio de venta */}
          <FormField
            control={control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de venta *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Precio base de venta al público
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descuento */}
          <FormField
            control={control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descuento (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    step="0.1"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Descuento aplicado al precio base
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Impuestos */}
          <FormField
            control={control}
            name="taxes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impuestos (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100"
                    step="0.1"
                    placeholder="16"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  IVA u otros impuestos aplicables
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Resumen de cálculos */}
        {(price > 0 || cost > 0) && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resumen de precios
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Precio final</p>
                <p className="font-semibold">{formatCurrency(finalPrice)}</p>
                {discount > 0 && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatCurrency(price)}
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Con impuestos</p>
                <p className="font-semibold">{formatCurrency(priceWithTaxes)}</p>
                {taxes > 0 && (
                  <p className="text-xs text-green-600">
                    +{formatCurrency(priceWithTaxes - finalPrice)} IVA
                  </p>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Ganancia</p>
                <p className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Margen</p>
                <Badge className={getMarginColor(margin)}>
                  {margin.toFixed(1)}%
                </Badge>
              </div>
            </div>

            {/* Alertas de precios */}
            <div className="mt-3 space-y-2">
              {cost >= price && price > 0 && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  El costo es mayor o igual al precio de venta. Verifica los valores.
                </div>
              )}
              
              {margin < 10 && margin > 0 && (
                <div className="flex items-center gap-2 text-yellow-600 text-sm">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Margen de ganancia bajo (&lt;10%). Considera ajustar los precios.
                </div>
              )}
              
              {margin >= 30 && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Excelente margen de ganancia.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
