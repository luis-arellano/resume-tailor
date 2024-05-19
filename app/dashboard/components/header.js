// DashboardHeader.js
"use client";
import ButtonAccount from "@/components/ButtonAccount";
import Image from "next/image";
import logo from "@/app/icon.png";
import config from "@/config";

function DashboardHeader() {

    return (
    <header className="p-4 bg-base-200">
        {/* Logo / Name on large screens */}
        <div className="flex flex-1">
            <div className="flex items-center gap-2 shrink-0">
                <Image
                    src={logo}
                    alt={`${config.appName} logo`}
                    className="w-8 m-2"
                    placeholder="blur"
                    priority={true}
                    width={32}
                    height={32}
                />
                <span className="text-lg font-bold">Resume Tailor</span>

            </div>

            {/* Account button on large screens */}
            <div className="hidden lg:flex lg:justify-end lg:flex-1">
                <ButtonAccount />
            </div>

        </div>
    </header>
    )
}

export default DashboardHeader;