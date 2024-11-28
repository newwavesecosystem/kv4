import Image from "next/image";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import { cn } from "~/lib/utils";
import {getMyCookies} from "~/lib/cookiesFunctions";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import OneGovAppToggleIcon from "~/components/icon/outline/1GovAppToggleIcon";

function Guest({ children }: { children: React.ReactNode }) {

  const [appToggle, setAppToggles] = useState({appsToggle:[], adminUI: {
      "name": "1Gov Admin",
      "url": "https://govsupport.convergenceondemand.com/admin/tenant"
    } });



  const get1govToggles = (id: any) => {
    axios
        .get(`${process.env.NEXT_PUBLIC_1GOV_URL}/sso/user/validateUser/conferencing`,{headers:{'Authorization': `Bearer ${id}`}})
        .then(function (response) {
          const responseData = response.data;

          if (responseData?.status == 'SUCCESS') {
            setAppToggles(responseData?.user?.toggleDetails);
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .finally(function () {
          // always executed
        });
  };


  useEffect(() => {
    get1govToggles(getMyCookies("token"));
  }, [""]);


  return (
    <div
      className={cn(
        "flex min-h-svh flex-col items-stretch text-a11y bg-primary/60 font-inter antialiased",
      )}
    >
      <div className="sticky h-20 border-b border-a11y/20 top-0 z-50 hidden w-full justify-between bg-primary/20 px-5 py-4 text-sm backdrop-blur-[3px] lg:flex">
        {/* left side */}
        <div className="flex items-center gap-2">
          <Image src="/conference_logo.png" alt="logo" width={53} height={53} />
            <span className="font-semibold text-base font-['Raleway']">Conference</span>
          {/*<Link href="/">Solutions</Link>*/}
          {/*<Link href="/">Contact sales</Link>*/}
          {/*<Link href="/">Plan & Pricing</Link>*/}
        </div>
        {/* right side */}
          <div className="flex items-center gap-5">
              {/*<Link href="/">Join a Meeting Room</Link>*/}
              {/*<Link href="/">Login</Link>*/}
              {/*<button className=" rounded-2xl bg-primary px-4 py-2 ">*/}
              {/*  Sign up, It&apos;s Free*/}
              {/*</button>*/}
              {/* Dropdown Menu for 1gov Toggles */}
              {appToggle?.appsToggle?.length > 0 && <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <div title="You can click here to access your other 1Gov Applications"
                           className="rounded-full bg-primary/80 p-1 cursor-pointer">
                          <OneGovAppToggleIcon className="h-5 w-5 "/>
                      </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                      align="end"
                      className="border-0 bg-primary text-a11y"
                  >
                      {appToggle?.appsToggle?.map((atg: any, index: number) => (
                          <DropdownMenuItem
                              key={index}
                              onClick={() => {
                                  window.open(atg.url, "_blank");
                              }}
                              className="py-2"
                          >
                              <img src={atg.logo} alt={`${atg.name} logo`} width="30px" height="30px"
                                   className="mr-3"/> {atg.name}
                          </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator className="h-0.5"/>
                      {appToggle?.adminUI != null && <DropdownMenuItem onClick={() => {
                          window.open(appToggle?.adminUI?.url, "_blank");
                      }} className="py-2 text-center">
                          {appToggle?.adminUI?.name}
                      </DropdownMenuItem>}
                  </DropdownMenuContent>
              </DropdownMenu>}
              {/* End Dropdown Menu for 1gov Toggles */}

          </div>
      </div>
        {children}
    </div>
  );
}

export default Guest;
