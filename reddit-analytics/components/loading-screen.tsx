export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div 
        className="w-8 h-8 border-4 border-t-[#f56565] border-gray-700 rounded-full animate-spin"
        style={{ borderTopColor: '#f56565' }}
      >
      </div>
    </div>
  )
} 