import { Button } from "@nextui-org/react";
import Image from "next/image";

export default function RoundImageButton({ imageLink, color, isDisabled, handleClick }) {
    return (
        <div className="fixed bottom-6 right-6">
            <Button
                color={color}
                onPress={handleClick}
                className="rounded-full p-0 shadow-lg flex items-center justify-center w-14 h-14"
                disabled={isDisabled}
                isIconOnly
            >
                <Image
                    alt="icon"
                    src={imageLink}
                    width="14"
                    height="14"
                    className="w-8 h-8 object-contain"
                />
            </Button>
        </div>
    );
};