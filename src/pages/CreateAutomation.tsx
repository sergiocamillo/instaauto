import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  X,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  useFiles,
  useAutomations,
  useCreateAutomation,
  useUpdateAutomation,
  useHasConnectedAccount,
} from "@/lib/hooks";
import { type AutomationInput } from "@/lib/api-resources";
import { ACTIONS, TRIGGERS } from "@/lib/catalog";
import type { ActionType, KeywordMatch, TriggerType } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { Stepper } from "@/features/wizard/Stepper";
import { DmPreview, type PreviewDraft } from "@/features/wizard/DmPreview";
import { MediaPicker } from "@/features/wizard/MediaPicker";
import { DM_TEMPLATES, COMMENT_REPLY_TEMPLATES } from "@/lib/message-templates";

const STEPS = ["Gatilho", "Palavra-chave", "Ação"];
const KEYWORD_EXAMPLES = ["LINK", "PDF", "GUIA", "QUERO", "IA", "AULA"];

interface ActionConfigState {
  message: string;
  comment_reply: string;
  comment_replies: string[];
  steps: MessageStepState[];
  link: string;
  file_id: string;
  tag: string;
  require_follow: boolean;
  follow_prompt: string;
  follow_button_label: string;
  button_label: string;
  button_followup: string;
}

interface MessageStepState {
  message: string;
  delay_minutes: number;
  wait_for_reply: boolean;
}

const defaultStep: MessageStepState = {
  message: "",
  delay_minutes: 0,
  wait_for_reply: false,
};

const emptyConfig: ActionConfigState = {
  message: "",
  comment_reply: "",
  comment_replies: [""],
  steps: [{ ...defaultStep }],
  link: "",
  file_id: "",
  tag: "",
  require_follow: false,
  follow_prompt:
    "Antes de liberar o material, siga meu perfil e toque no botão abaixo.",
  follow_button_label: "Já estou seguindo",
  button_label: "",
  button_followup: "",
};

export function CreateAutomation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const { data: files = [] } = useFiles();
  const { data: automations = [] } = useAutomations();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation();
  const { connected, isLoading: checkingAccount } = useHasConnectedAccount();

  const editing = useMemo(
    () => automations.find((a) => a.id === editId),
    [automations, editId],
  );

  const [step, setStep] = useState(0);
  const [name, setName] = useState(editing?.name ?? "");
  const [trigger, setTrigger] = useState<TriggerType | null>(
    editing?.trigger.type ?? null,
  );
  const [target, setTarget] = useState(editing?.trigger.target_ref ?? "");
  const [keywordMatch, setKeywordMatch] = useState<KeywordMatch>(
    editing?.trigger.keyword_match ?? "specific",
  );
  const [keywords, setKeywords] = useState<string[]>(
    editing?.trigger.keywords ?? [],
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [actions, setActions] = useState<ActionType[]>(
    editing?.actions.map((a) => a.type) ?? [],
  );
  const [config, setConfig] = useState<ActionConfigState>(() => {
    if (!editing) return emptyConfig;
    const merged = { ...emptyConfig };
    editing.actions.forEach((a) => {
      const steps = Array.isArray(a.config.steps)
        ? a.config.steps.map((step) => ({
            message: String(step.message ?? ""),
            delay_minutes: Number(step.delay_minutes ?? 0),
            wait_for_reply: Boolean(step.wait_for_reply),
          }))
        : undefined;
      Object.assign(merged, {
        message: a.config.message ?? merged.message,
        comment_reply: a.config.comment_reply ?? merged.comment_reply,
        comment_replies: Array.isArray(a.config.comment_replies)
          ? a.config.comment_replies.map((reply) => String(reply))
          : a.config.comment_reply
            ? [String(a.config.comment_reply)]
            : merged.comment_replies,
        steps:
          steps && steps.length > 0
            ? steps
            : a.config.message
              ? [{ ...defaultStep, message: String(a.config.message) }]
              : merged.steps,
        link: a.config.link ?? merged.link,
        file_id: a.config.file_id ?? merged.file_id,
        tag: a.config.tag ?? merged.tag,
        require_follow: Boolean(
          a.config.require_follow ?? merged.require_follow,
        ),
        follow_prompt: a.config.follow_prompt ?? merged.follow_prompt,
        follow_button_label:
          a.config.follow_button_label ?? merged.follow_button_label,
        button_label: a.config.button_label ?? merged.button_label,
        button_followup: a.config.button_followup ?? merged.button_followup,
      });
    });
    return merged;
  });

  const selectedTrigger = TRIGGERS.find((t) => t.value === trigger);
  const needsTarget = selectedTrigger?.needsTarget ?? false;

  const update = (patch: Partial<ActionConfigState>) =>
    setConfig((c) => ({ ...c, ...patch }));

  function updateStep(index: number, patch: Partial<MessageStepState>) {
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((step, i) =>
        i === index ? { ...step, ...patch } : step,
      ),
    }));
  }

  function addStep() {
    setConfig((c) => ({ ...c, steps: [...c.steps, { ...defaultStep }] }));
  }

  function removeStep(index: number) {
    setConfig((c) => ({
      ...c,
      steps:
        c.steps.length === 1
          ? [{ ...defaultStep }]
          : c.steps.filter((_, i) => i !== index),
    }));
  }

  function updateCommentReply(index: number, value: string) {
    setConfig((c) => ({
      ...c,
      comment_reply: index === 0 ? value : c.comment_reply,
      comment_replies: c.comment_replies.map((reply, i) =>
        i === index ? value : reply,
      ),
    }));
  }

  function addCommentReply() {
    setConfig((c) => ({
      ...c,
      comment_replies: [...c.comment_replies, ""],
    }));
  }

  function removeCommentReply(index: number) {
    setConfig((c) => {
      const next =
        c.comment_replies.length === 1
          ? [""]
          : c.comment_replies.filter((_, i) => i !== index);
      return {
        ...c,
        comment_reply: next[0] ?? "",
        comment_replies: next,
      };
    });
  }

  function toggleAction(a: ActionType) {
    setActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  function addKeyword(value: string) {
    const v = value.trim().toUpperCase();
    if (!v || keywords.includes(v)) return;
    setKeywords((k) => [...k, v]);
    setKeywordInput("");
  }

  // Step validation
  const canNext =
    step === 0
      ? Boolean(trigger) && (!needsTarget || target.trim().length > 0)
      : step === 1
        ? keywordMatch === "any" || keywords.length > 0
        : actions.length > 0;

  const draft: PreviewDraft = {
    triggerLabel: selectedTrigger?.label ?? "",
    keywords,
    keywordMatch,
    actions,
    message:
      config.steps.find((s) => s.message.trim())?.message ?? config.message,
    steps: config.steps,
    link: config.link,
    buttonLabel: config.button_label,
    buttonFollowup: config.button_followup,
    file: files.find((f) => f.id === config.file_id),
  };

  function handleSave() {
    const autoName =
      name.trim() ||
      `${keywords[0] ?? "Automação"} · ${selectedTrigger?.label ?? ""}`;

    const input: AutomationInput = {
      name: autoName,
      status: editing?.status ?? "active",
      trigger: {
        type: trigger!,
        targetRef: needsTarget ? target : undefined,
        keywordMatch,
        keywords: keywordMatch === "any" ? [] : keywords,
      },
      actions: actions.map((type, order) => ({
        type,
        order,
        config: {
          message:
            config.steps.find((s) => s.message.trim())?.message ||
            config.message ||
            undefined,
          comment_reply: config.comment_reply || undefined,
          comment_replies:
            type === "reply_comment"
              ? config.comment_replies.filter((reply) => reply.trim())
              : undefined,
          steps:
            type === "send_dm" ||
            type === "send_link" ||
            type === "reply_with_button" ||
            type === "send_file"
              ? config.steps
                  .filter((s) => s.message.trim())
                  .map((s) => ({
                    message: s.message,
                    delay_minutes: Math.max(0, Number(s.delay_minutes) || 0),
                    wait_for_reply: s.wait_for_reply,
                  }))
              : undefined,
          link: config.link || undefined,
          file_id: config.file_id || undefined,
          tag: config.tag || undefined,
          require_follow:
            type === "send_link" || type === "send_file"
              ? config.require_follow
              : undefined,
          follow_prompt:
            (type === "send_link" || type === "send_file") &&
            config.require_follow
              ? config.follow_prompt
              : undefined,
          follow_button_label:
            (type === "send_link" || type === "send_file") &&
            config.require_follow
              ? config.follow_button_label
              : undefined,
          button_label: config.button_label || undefined,
          button_followup: config.button_followup || undefined,
        },
      })),
    };

    const onSuccess = () => navigate("/automacoes");
    if (editing) {
      updateAutomation.mutate({ id: editing.id, input }, { onSuccess });
    } else {
      createAutomation.mutate(input, { onSuccess });
    }
  }

  // Bloqueio: criar automação exige uma conta da Meta conectada.
  if (checkingAccount) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="size-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div>
        <button
          onClick={() => navigate("/automacoes")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Voltar para automações
        </button>
        <Card>
          <EmptyState
            icon={Link2}
            title="Conecte uma conta primeiro"
            description="Para criar automações você precisa conectar uma conta do Instagram (via Instagram ou Facebook) nas Configurações."
            action={
              <Button onClick={() => navigate("/configuracoes")}>
                Ir para Configurações
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/automacoes")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Voltar para automações
      </button>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {editing ? "Editar automação" : "Criar automação"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Configure o gatilho, a palavra-chave e a ação em 3 passos.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Nome da automação (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <Card className="mb-6 px-5 py-4">
        <Stepper steps={STEPS} current={step} onStepClick={setStep} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* STEP 1 — Trigger */}
          {step === 0 && (
            <Card className="animate-in p-5">
              <h2 className="text-base font-semibold text-ink">
                Escolha o gatilho
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                O que dispara essa automação?
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {TRIGGERS.map((t) => {
                  const active = trigger === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTrigger(t.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                          : "border-border bg-surface hover:border-border-strong hover:bg-canvas",
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-brand-600 text-white"
                            : "bg-canvas text-ink-soft",
                        )}
                      >
                        <t.icon className="size-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {t.label}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {t.description}
                        </p>
                      </div>
                      {active && (
                        <Check className="ml-auto size-4 shrink-0 text-brand-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {needsTarget && (
                <div className="mt-4">
                  <Label hint="selecione a mídia da sua conta">
                    {trigger === "reel_comment_specific"
                      ? "Qual Reel?"
                      : "Qual publicação?"}
                  </Label>
                  <MediaPicker
                    filter={
                      trigger === "reel_comment_specific" ? "reel" : "post"
                    }
                    value={target}
                    onChange={setTarget}
                  />
                </div>
              )}
            </Card>
          )}

          {/* STEP 2 — Keyword */}
          {step === 1 && (
            <Card className="animate-in p-5">
              <h2 className="text-base font-semibold text-ink">
                Configurar palavra-chave
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Quando a automação deve responder?
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "any" as const,
                    title: "Qualquer palavra",
                    desc: "Responde a qualquer comentário ou mensagem.",
                  },
                  {
                    value: "specific" as const,
                    title: "Palavra ou expressão específica",
                    desc: "Responde só quando a palavra exata for usada.",
                  },
                ].map((opt) => {
                  const active = keywordMatch === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setKeywordMatch(opt.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                          : "border-border hover:border-border-strong hover:bg-canvas",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-ink">
                          {opt.title}
                        </p>
                        {active && <Check className="size-4 text-brand-600" />}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-soft">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {keywordMatch === "specific" && (
                <div className="mt-5">
                  <Label hint="pressione Enter para adicionar">
                    Palavras-chave
                  </Label>
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword(keywordInput);
                      }
                    }}
                    placeholder="Digite uma palavra e pressione Enter"
                  />

                  {keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {keywords.map((k) => (
                        <Badge key={k} tone="brand" className="pr-1">
                          {k}
                          <button
                            onClick={() =>
                              setKeywords((arr) => arr.filter((x) => x !== k))
                            }
                            className="ml-1 rounded-full p-0.5 hover:bg-brand-100"
                            aria-label={`Remover ${k}`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-ink-muted">
                      Exemplos rápidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {KEYWORD_EXAMPLES.filter(
                        (ex) => !keywords.includes(ex),
                      ).map((ex) => (
                        <button
                          key={ex}
                          onClick={() => addKeyword(ex)}
                          className="rounded-full border border-dashed border-border-strong px-3 py-1 text-xs font-medium text-ink-soft hover:border-brand-400 hover:text-brand-600"
                        >
                          + {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* STEP 3 — Action */}
          {step === 2 && (
            <Card className="animate-in p-5">
              <h2 className="text-base font-semibold text-ink">
                Escolha a ação
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                O que acontece quando o gatilho dispara? Selecione uma ou mais.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ACTIONS.map((a) => {
                  const active = actions.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      onClick={() => toggleAction(a.value)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                        active
                          ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                          : "border-border hover:border-border-strong hover:bg-canvas",
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          active
                            ? "bg-brand-600 text-white"
                            : "bg-canvas text-ink-soft",
                        )}
                      >
                        <a.icon className="size-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {a.label}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {a.description}
                        </p>
                      </div>
                      {active && (
                        <Check className="ml-auto size-4 shrink-0 text-brand-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Conditional config */}
              {actions.length > 0 && (
                <div className="mt-5 space-y-4 rounded-xl border border-border bg-canvas p-4">
                  <p className="text-sm font-semibold text-ink">
                    Configurar conteúdo
                  </p>

                  {(actions.includes("send_dm") ||
                    actions.includes("reply_with_button") ||
                    actions.includes("send_link") ||
                    actions.includes("send_file")) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Fluxo de mensagens por DM</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addStep}
                        >
                          <Plus className="size-4" />
                          Mensagem
                        </Button>
                      </div>

                      {config.steps.map((stepItem, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border bg-surface p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-ink-muted">
                              Mensagem {index + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeStep(index)}
                              className="rounded-md p-1 text-ink-muted hover:bg-danger-soft hover:text-danger"
                              aria-label="Remover mensagem"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <Textarea
                            placeholder="Olá! Que bom te ver por aqui 😊"
                            value={stepItem.message}
                            onChange={(e) =>
                              updateStep(index, { message: e.target.value })
                            }
                          />
                          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <div>
                              <Label>Enviar após</Label>
                              <Input
                                type="number"
                                min={0}
                                value={stepItem.delay_minutes}
                                onChange={(e) =>
                                  updateStep(index, {
                                    delay_minutes: Number(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <label className="flex items-end gap-2 pb-2 text-sm text-ink-soft">
                              <input
                                type="checkbox"
                                checked={stepItem.wait_for_reply}
                                onChange={(e) =>
                                  updateStep(index, {
                                    wait_for_reply: e.target.checked,
                                  })
                                }
                              />
                              Após próxima resposta
                            </label>
                          </div>
                        </div>
                      ))}

                      <p className="text-xs text-ink-muted">
                        Variáveis: {"{{username}}"}, {"{{nome}}"},{" "}
                        {"{{comentario}}"}, {"{{keyword}}"}.
                      </p>
                      <SuggestionChips
                        templates={DM_TEMPLATES}
                        onPick={(t) => updateStep(0, { message: t })}
                      />
                    </div>
                  )}

                  {actions.includes("reply_comment") && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label hint="uma variação é escolhida por comentário">
                          Respostas ao comentário
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addCommentReply}
                        >
                          <Plus className="size-4" />
                          Variação
                        </Button>
                      </div>
                      {config.comment_replies.map((reply, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-border bg-surface p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold text-ink-muted">
                              Variação {index + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeCommentReply(index)}
                              className="rounded-md p-1 text-ink-muted hover:bg-danger-soft hover:text-danger"
                              aria-label="Remover variação"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <Textarea
                            placeholder="Prontinho, {{username}}! Te mandei tudo na DM 📩"
                            value={reply}
                            onChange={(e) =>
                              updateCommentReply(index, e.target.value)
                            }
                          />
                        </div>
                      ))}
                      <p className="text-xs text-ink-muted">
                        Variáveis: {"{{username}}"}, {"{{nome}}"},{" "}
                        {"{{comentario}}"}, {"{{keyword}}"}.
                      </p>
                      <SuggestionChips
                        templates={COMMENT_REPLY_TEMPLATES}
                        onPick={(t) => updateCommentReply(0, t)}
                      />
                    </div>
                  )}

                  {(actions.includes("send_link") ||
                    actions.includes("reply_with_button")) && (
                    <div>
                      <Label>Link</Label>
                      <Input
                        placeholder="https://seu-link.com/material"
                        value={config.link}
                        onChange={(e) => update({ link: e.target.value })}
                      />
                    </div>
                  )}

                  {actions.includes("reply_with_button") && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Texto do botão</Label>
                        <Input
                          placeholder="Receber link"
                          value={config.button_label}
                          onChange={(e) =>
                            update({ button_label: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Mensagem após o clique</Label>
                        <Input
                          placeholder="Aqui está o link prometido:"
                          value={config.button_followup}
                          onChange={(e) =>
                            update({ button_followup: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {actions.includes("send_file") && (
                    <div>
                      <Label>Arquivo</Label>
                      <select
                        value={config.file_id}
                        onChange={(e) => update({ file_id: e.target.value })}
                        className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">Selecione um arquivo…</option>
                        {files.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(actions.includes("send_link") ||
                    actions.includes("send_file")) && (
                    <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
                      <label className="flex items-start gap-2 text-sm text-ink">
                        <input
                          type="checkbox"
                          checked={config.require_follow}
                          onChange={(e) =>
                            update({ require_follow: e.target.checked })
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="block font-medium">
                            Exigir que siga antes de entregar
                          </span>
                          <span className="text-xs text-ink-muted">
                            O link ou arquivo fica pendente até a pessoa tocar
                            no botão e a Meta confirmar que segue o perfil.
                          </span>
                        </span>
                      </label>

                      {config.require_follow && (
                        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                          <div>
                            <Label>Mensagem de confirmação</Label>
                            <Textarea
                              placeholder="Antes de liberar o material, siga meu perfil e toque no botão abaixo."
                              value={config.follow_prompt}
                              onChange={(e) =>
                                update({ follow_prompt: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <Label>Botão</Label>
                            <Input
                              placeholder="Já estou seguindo"
                              value={config.follow_button_label}
                              onChange={(e) =>
                                update({
                                  follow_button_label: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {actions.includes("add_tag") && (
                    <div>
                      <Label>Tag</Label>
                      <Input
                        placeholder="lead-quente"
                        value={config.tag}
                        onChange={(e) => update({ tag: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() =>
                step === 0 ? navigate("/automacoes") : setStep(step - 1)
              }
            >
              <ArrowLeft className="size-4" />
              {step === 0 ? "Cancelar" : "Voltar"}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button disabled={!canNext} onClick={handleSave}>
                <Sparkles className="size-4" />
                {editing ? "Salvar alterações" : "Ativar automação"}
              </Button>
            )}
          </div>
        </div>

        {/* Live preview rail */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <DmPreview draft={draft} />
        </div>
      </div>
    </div>
  );
}

/** Chips de sugestão de mensagem; clicar preenche o campo. */
function SuggestionChips({
  templates,
  onPick,
}: {
  templates: string[];
  onPick: (text: string) => void;
}) {
  return (
    <div className="mt-2">
      <p className="mb-1.5 text-xs font-medium text-ink-muted">
        Sugestões (clique para usar)
      </p>
      <div className="flex flex-col gap-1.5">
        {templates.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(t)}
            className="rounded-lg border border-dashed border-border-strong px-3 py-1.5 text-left text-xs text-ink-soft transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
