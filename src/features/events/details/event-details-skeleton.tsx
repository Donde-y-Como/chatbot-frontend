import { Skeleton } from "../../../components/ui/skeleton";

export
    function EventDetailsSkeleton() {
    return (
        <div className='flex flex-col md:flex-row animate-pulse'>
            <div className='md:w-1/2'>
                <Skeleton className='h-64 w-full' />
            </div>
            <div className='p-6 md:w-1/2'>
                <Skeleton className='h-8 w-3/4 mb-2' />
                <Skeleton className='h-4 w-full mb-6' />
                {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex items-start mb-4'>
                        <Skeleton className='h-5 w-5 mr-3' />
                        <div className='flex-1'>
                            <Skeleton className='h-4 w-1/4 mb-1' />
                            <Skeleton className='h-3 w-3/4' />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}