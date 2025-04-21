import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function ChatListItemSkeleton() {
  return (
    <>
      <div className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-md transition-colors">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex justify-between items-center w-full">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="flex items-center gap-1 mt-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="self-center">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
      <Separator className="my-1" />
    </>
  );
}