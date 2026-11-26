"use client";

import ContactsSection from "@/components/common/ContactsSection";

export default function ContactsPage() {
  return (
    <main
      id="main-content"
      data-contacts-page="true"
      tabIndex={-1}
      className="relative z-10 flex w-full flex-col justify-start gap-0 px-4 focus:outline-none bg-transparent"
    >
      <ContactsSection standalone />
    </main>
  );
}
