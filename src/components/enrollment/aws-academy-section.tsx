"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Enrollment } from "@/types/enrollment";
import { WindowState } from "@/lib/enrollment-window";
import { EnrollmentForm } from "./enrollment-form";
import { EnrollmentStatusCard } from "./enrollment-status";
import { Icon } from "@/components/icons/icon";
import { GradientBlobs } from "@/components/decor/gradient-blobs";

function InfoMessage({
  icon,
  children,
}: {
  icon: "clock" | "trophy";
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[70vh] items-center overflow-hidden px-6 text-center text-neutral-200">
      <GradientBlobs />
      <div className="relative mx-auto max-w-xl animate-fade-in-up">
        <Icon name={icon} className="mx-auto mb-6 h-12 w-12 text-brand-blue" />
        <h1 className="mb-4 font-mono text-2xl font-semibold text-accent">
          AWS Academy
        </h1>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function AwsAcademySection({
  enrollment,
  windowState,
  openAtLabel,
  closeAtLabel,
}: {
  enrollment: Enrollment | null;
  windowState: WindowState;
  openAtLabel: string;
  closeAtLabel: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  function handleSubmitted() {
    setEditing(false);
    setJustSubmitted(true);
    router.refresh();
  }

  if (!enrollment) {
    if (windowState === "before") {
      return (
        <InfoMessage icon="clock">
          Las inscripciones abren el{" "}
          <strong className="text-accent">{openAtLabel}</strong>.
        </InfoMessage>
      );
    }
    if (windowState === "after") {
      return (
        <InfoMessage icon="trophy">
          La inscripción a esta cohorte ha cerrado. La siguiente cohorte
          abrirá en el próximo ciclo académico.
        </InfoMessage>
      );
    }
    return (
      <div className="relative min-h-[70vh] overflow-hidden px-6 py-16">
        <GradientBlobs />
        <div className="relative mx-auto max-w-xl animate-fade-in-up">
          <div className="mb-2 flex items-center gap-3">
            <Icon name="bolt" className="h-7 w-7 text-brand-amber" />
            <h1 className="font-mono text-2xl font-semibold text-accent">
              Registro a AWS Academy
            </h1>
          </div>
          <p className="mb-8 text-sm text-neutral-400">
            La ventana de inscripción cierra el {closeAtLabel}.
          </p>
          <EnrollmentForm onSubmitted={handleSubmitted} />
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in-up px-6 py-16">
        <h1 className="mb-8 font-mono text-2xl font-semibold text-accent">
          Modificar inscripción
        </h1>
        <EnrollmentForm
          initial={{
            fullName: enrollment.fullName,
            studentCode: enrollment.studentCode,
            hasPrerequisite: enrollment.hasPrerequisite,
            credlyUrl: enrollment.credlyUrl,
            courseId: enrollment.courseId,
          }}
          onSubmitted={handleSubmitted}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const canEdit = windowState === "open" && enrollment.status !== "enrolled";

  return (
    <div className="mx-auto max-w-xl animate-fade-in-up px-6 py-16">
      <h1 className="mb-2 font-mono text-2xl font-semibold text-accent">
        Tu inscripción a AWS Academy
      </h1>
      {justSubmitted && (
        <p className="mb-6 animate-pulse-glow border border-accent/50 bg-accent/10 p-3 text-sm text-accent">
          ¡Gracias! Registramos tu solicitud.
        </p>
      )}
      <EnrollmentStatusCard enrollment={enrollment} />
      {canEdit ? (
        <button
          onClick={() => setEditing(true)}
          className="mt-6 border border-accent px-5 py-2 font-mono text-sm text-accent transition duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-bg hover:shadow-[0_0_20px_-4px_#FF9900]"
        >
          Modificar inscripción
        </button>
      ) : (
        <p className="mt-6 text-sm text-neutral-400">
          {enrollment.status === "enrolled"
            ? "Tu matrícula ya está confirmada y no se puede modificar."
            : "La ventana de inscripción cerró. Tu inscripción quedó congelada en este estado."}
        </p>
      )}
    </div>
  );
}
