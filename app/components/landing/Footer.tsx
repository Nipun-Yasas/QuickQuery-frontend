import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-backgroundSecondary rounded-xl shadow-xs p-8 mt-12 sm:mt-12 md:mt-12 lg:mt-20 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto border-none">
      <div className="">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="https://flowbite.com/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <span className="text-heading self-center text-2xl font-semibold whitespace-nowrap">
              QuickQuery
            </span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-body sm:mb-0">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                Licensing
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-default sm:mx-auto lg:my-8" />
        <span className="block text-sm text-body sm:text-center">
          © {new Date().getFullYear()}{" "}
          <a href="#" className="hover:underline">
            QuickQuery
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};
