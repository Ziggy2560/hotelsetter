import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";
import { ConfirmationContent } from "@/components/booking/confirmation-content";

export default function ConfirmationPage() {
  return (
    <>
      <Navbar variant="solid" />
      <main className="bg-surface min-h-screen py-16 px-4">
        <Suspense
          fallback={
            <div className="max-w-[640px] mx-auto text-center text-text-muted">
              Loading...
            </div>
          }
        >
          <ConfirmationContent />
        </Suspense>
      </main>
    </>
  );
}
