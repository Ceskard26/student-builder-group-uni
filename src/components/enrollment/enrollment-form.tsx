"use client";

import { useState, FormEvent } from "react";
import { isValidCredlyUrl } from "@/lib/credly";
import { getSelectableCourses } from "@/config/courses";
import { PrivacyNoticeText } from "@/components/privacy-notice";

const selectableCourses = getSelectableCourses();

export interface EnrollmentFormInitial {
  fullName: string;
  studentCode: string;
  hasPrerequisite: boolean;
  credlyUrl?: string;
  courseId: string;
}

export function EnrollmentForm({
  initial,
  onSubmitted,
  onCancel,
}: {
  initial?: EnrollmentFormInitial;
  onSubmitted: () => void;
  onCancel?: () => void;
}) {
  const [hasPrerequisite, setHasPrerequisite] = useState<boolean | null>(
    initial?.hasPrerequisite ?? null,
  );
  const [credlyUrl, setCredlyUrl] = useState(initial?.credlyUrl ?? "");
  const [courseId, setCourseId] = useState(
    initial?.hasPrerequisite ? initial.courseId : "",
  );
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [studentCode, setStudentCode] = useState(initial?.studentCode ?? "");
  const [acceptedPrivacyNotice, setAcceptedPrivacyNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credlyValid = isValidCredlyUrl(credlyUrl);
  const showCatalog = hasPrerequisite === true && credlyValid;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (hasPrerequisite === null) {
      setError("Responde si ya completaste el prerequisito.");
      return;
    }
    if (hasPrerequisite && !showCatalog) {
      setError("Ingresa una URL de Credly válida para ver el catálogo de cursos.");
      return;
    }
    if (hasPrerequisite && !courseId) {
      setError("Selecciona un curso.");
      return;
    }
    if (!acceptedPrivacyNotice) {
      setError("Debes aceptar el aviso de privacidad.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          studentCode,
          hasPrerequisite,
          credlyUrl: hasPrerequisite ? credlyUrl.trim() : undefined,
          courseId: hasPrerequisite ? courseId : undefined,
          acceptedPrivacyNotice,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo enviar la inscripción.");
        return;
      }

      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="font-mono text-sm text-white">
          ¿Ya completaste AWS Academy Cloud Foundations o tienes la
          certificación AWS Certified Cloud Practitioner?
        </legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input
              type="radio"
              name="hasPrerequisite"
              checked={hasPrerequisite === true}
              onChange={() => setHasPrerequisite(true)}
              className="accent-accent"
            />
            Sí
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input
              type="radio"
              name="hasPrerequisite"
              checked={hasPrerequisite === false}
              onChange={() => {
                setHasPrerequisite(false);
                setCourseId("");
                setCredlyUrl("");
              }}
              className="accent-accent"
            />
            No
          </label>
        </div>
      </fieldset>

      {hasPrerequisite === false && (
        <p className="animate-fade-in-up border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
          Serás inscrito en <strong className="text-accent">AWS Academy Cloud Foundations</strong>,
          el curso de entrada del programa.
        </p>
      )}

      {hasPrerequisite === true && (
        <div className="animate-fade-in-up space-y-2">
          <label className="block font-mono text-sm text-white" htmlFor="credlyUrl">
            URL pública de tu credencial en Credly
          </label>
          <input
            id="credlyUrl"
            type="url"
            required
            value={credlyUrl}
            onChange={(e) => {
              setCredlyUrl(e.target.value);
              setCourseId("");
            }}
            placeholder="https://www.credly.com/badges/..."
            className="w-full border border-white/20 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
          {credlyUrl.length > 0 && !credlyValid && (
            <p className="text-xs text-red-400">
              Esa URL no parece ser una URL pública válida de Credly (credly.com).
            </p>
          )}
        </div>
      )}

      {showCatalog && (
        <fieldset className="animate-fade-in-up space-y-3">
          <legend className="font-mono text-sm text-white">
            Elige un curso (selección única)
          </legend>
          <div className="space-y-2">
            {selectableCourses.map((course) => (
              <label
                key={course.id}
                className="flex items-center gap-3 border border-white/10 px-3 py-2 text-sm text-neutral-200 transition-colors duration-200 hover:border-accent/60 hover:bg-white/5"
              >
                <input
                  type="radio"
                  name="courseId"
                  value={course.id}
                  checked={courseId === course.id}
                  onChange={() => setCourseId(course.id)}
                  className="accent-accent"
                />
                {course.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {(hasPrerequisite === false || showCatalog) && (
        <div className="animate-fade-in-up space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block font-mono text-sm text-white" htmlFor="fullName">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                minLength={3}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-sm text-white" htmlFor="studentCode">
                Código de alumno
              </label>
              <input
                id="studentCode"
                type="text"
                required
                minLength={3}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-6">
            <PrivacyNoticeText />
            <label className="flex items-start gap-2 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={acceptedPrivacyNotice}
                onChange={(e) => setAcceptedPrivacyNotice(e.target.checked)}
                className="mt-1 accent-accent"
              />
              He leído y acepto el aviso de privacidad.
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="border border-accent px-5 py-2 font-mono text-sm text-accent transition duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-bg hover:shadow-[0_0_20px_-4px_#FF9900] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? "Enviando…" : "Enviar inscripción"}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="border border-white/20 px-5 py-2 font-mono text-sm text-neutral-300 transition hover:border-white/40"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
