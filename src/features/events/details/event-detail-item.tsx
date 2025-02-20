export function EventDetailItem({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode
    label: string
    children: React.ReactNode
}) {
    return (
        <div className='flex items-start'>
            <div className='mr-3 mt-1 text-muted-foreground'>{icon}</div>
            <div>
                <div className='font-semibold text-sm'>{label}</div>
                <div className='text-sm text-muted-foreground'>{children}</div>
            </div>
        </div>
    )
}
