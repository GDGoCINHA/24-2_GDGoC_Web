export default function GreenTextButton({ text, isDisabled, handleClick }) {
    return (
        <div className="mt-6 text-center">
            <button
                onClick={handleClick}
                className="border border-green-400 text-green-400 px-4 py-2 rounded hover:bg-green-400 hover:text-white transition"
                disabled={isDisabled}
            >
                {text}
            </button>
        </div>
    );
};