import React from "react";
import { useRouter } from "next/navigation";
import {Button} from "@nextui-org/react";
import Image from "next/image";

import writeIcon from "@public/src/images/GDGoC_icon.png";

export default function CreateStudyButton() {
    const router = useRouter();

    return (
        <div className="fixed bottom-6 right-6">
            <Button
                color="danger"
                onPress={() => router.push(`/study/createStudy`)}
                className="rounded-full p-0 shadow-lg flex items-center justify-center w-14 h-14"
                isIconOnly
            >
                <Image
                    alt="icon"
                    src={writeIcon}
                    width="14"
                    height="14"
                    className="w-8 h-8 object-contain"
                />
            </Button>
        </div>
    );
};