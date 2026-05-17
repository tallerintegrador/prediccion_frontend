type StateBlockProps = {
  title: string
  description?: string
}

export function StateBlock({ title, description }: StateBlockProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
  )
}
