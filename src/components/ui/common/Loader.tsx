type LoaderProps = {
  isLoading?: boolean;
};

const Loader = ({ isLoading = true }: LoaderProps) => {
    if (!isLoading) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  };
  
  export default Loader;
