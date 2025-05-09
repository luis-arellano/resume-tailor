// DashboardHeader.js
"use client";
import ButtonAccount from "@/components/ButtonAccount";
import Image from "next/image";
import logo from "@/app/icon.png";
import config from "@/config";

function DashboardHeader() {
    return (
    <header className="h-14 bg-white border border-b-black">
        <div className="h-full flex items-center px-4">
            <div className="flex items-center gap-2">
                <Image
                    src={logo}
                    alt={`${config.appName} logo`}
                    className="w-6"
                    placeholder="blur"
                    priority={true}
                    width={24}
                    height={24}
                />
                <span className="text-base font-bold">Magic Resume</span>
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