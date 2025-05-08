import { Button } from "@nextui-org/react";

export default function SubmitButton({ type, text, isDisabled, handleClick }) {
    return (
        <div className="flex justify-center mt-4">
            <Button
                type={type}
                onPress={handleClick}
                className="w-3/4 max-w-sm h-14 bg-red-500 text-white text-lg font-semibold rounded-lg"
                disabled={isDisabled}
            >
                {text}
            </Button>
        </div>
    );
};