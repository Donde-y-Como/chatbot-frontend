import { ChevronDown, ChevronUp } from 'lucide-react';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function SocialMediaSection({ user, isSocialMediaExpanded, setIsSocialMediaExpanded }) {
  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <div className="flex items-center justify-between cursor-pointer">
        <div
          className="flex items-center space-x-2"
          onClick={() => setIsSocialMediaExpanded(!isSocialMediaExpanded)}
        >
          <h3 className="text-lg font-medium">Redes Sociales</h3>
          {isSocialMediaExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>

      {/* Conditional rendering of social media details */}
      {isSocialMediaExpanded && (
        <div className="grid grid-cols-1 gap-4">
          <FormItem>
            <FormLabel>WhatsApp</FormLabel>
            <FormControl>
              <Input value={user?.socialPlatforms?.whatsapp ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Facebook</FormLabel>
            <FormControl>
              <Input value={user?.socialPlatforms?.facebook ?? ''} readOnly />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Instagram</FormLabel>
            <FormControl>
              <Input value={user?.socialPlatforms?.instagram ?? ''} readOnly />
            </FormControl>
          </FormItem>
        </div>
      )}
    </div>
  );
}