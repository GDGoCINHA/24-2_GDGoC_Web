export default function GreenTextButton({ text, isDisabled, handleClick }) {
    return (
        <div className="mt-6 text-center">
            <button
                onClick={handleClick}
                className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white transition"
                disabled={isDisabled}
            >
                {text}
            </button>
        </div>
    );
};