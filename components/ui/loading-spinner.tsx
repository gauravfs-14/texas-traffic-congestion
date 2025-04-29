export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative h-16 w-16">
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 left-0 h-full w-full rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}
