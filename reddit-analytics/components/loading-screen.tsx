export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div 
        className="w-8 h-8 border-4 border-t-[#ff4600] border-gray-200 rounded-full animate-spin"
        style={{ borderTopColor: '#ff4600' }}
      >
      </div>
    </div>
  )
} 