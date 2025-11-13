type LoadingSpinnerProps = {
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'min-h-screen bg-white flex items-center justify-center'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-transparent border-t-[#ff385c] rounded-full animate-spin absolute top-0 left-0"></div>
          <div
            className="w-16 h-16 border-4 border-transparent border-r-[#ff385c] rounded-full animate-spin absolute top-0 left-0"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-900 text-lg font-semibold">{message}</p>
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 bg-[#ff385c] rounded-full animate-pulse"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-[#ff385c] rounded-full animate-pulse"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-[#ff385c] rounded-full animate-pulse"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

