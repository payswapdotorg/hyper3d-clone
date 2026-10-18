"use client";

/**
 * ASSET / EXPLORE rail — the studio's gallery strip: Featured (public,
 * seeded) and Mine (the signed-in user's real tasks), per the real
 * workspace layout. Cards show the task's server-rendered poster.
 */
import { Boxes, CircleDashed } from "lucide-react";
import { SmartImage } from "../smart-image";
import { cn } from "@/lib/utils";

export interface RailTask {
  task_uuid: string;
  prompt: string;
  image_url: string | null;
  user_state: string;
  time: string;
  is_featured: boolean;
  /** engine2 fields — present on task cards serialized with the engine layer */
  engine_used?: string | null;
  seed?: number | null;
  confirmed?: boolean;
}

export function TaskRail({
  rail,
  tasks,
  activeTaskId,
  onSelect,
  onRefresh,
}: {
  rail: "featured" | "mine";
  tasks: RailTask[];
  activeTaskId: string | null;
  onSelect: (task: RailTask) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-col">
      <div className="flex min-h-9 items-center gap-2">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-h3d-muted">
          <Boxes className="size-3" aria-hidden="true" />
          {rail === "featured" ? "Explore · Featured" : "Asset · Mine"}
        </p>
        <button
          type="button"
          className="min-h-9 rounded-md px-2 font-mono text-[10px] text-white/40 transition-colors hover:text-white"
          onClick={onRefresh}
          aria-label={`Refresh ${rail} tasks`}
        >
          refresh
        </button>
        <span className="font-mono text-[10px] text-white/30">({tasks.length})</span>
      </div>
      {tasks.length === 0 ? (
        <p className="flex items-center gap-1.5 px-2 text-xs text-white/30">
          <CircleDashed className="size-3" aria-hidden="true" />
          {rail === "featured" ? "Featured gallery is warming up…" : "Sign in and generate — your models land here."}
        </p>
      ) : (
        <div className="flex gap-2.5">
          {tasks.map((task) => (
            <button
              key={task.task_uuid}
              type="button"
              className={cn(
                "group relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border text-left transition-colors",
                activeTaskId === task.task_uuid
                  ? "border-h3d-purple/70"
                  : "border-white/10 hover:border-h3d-purple/50",
              )}
              onClick={() => onSelect(task)}
              aria-label={`Open ${task.prompt}`}
            >
              {task.image_url ? (
                <SmartImage
                  src={task.image_url}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1d1d28] to-[#17171b]">
                  <Boxes className="size-6 text-h3d-purple/50" aria-hidden="true" />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-white/90">
                {task.prompt}
              </span>
              {task.user_state !== "DonePreview" && task.user_state !== "done" && (
                <span className="absolute right-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 font-mono text-[9px] text-h3d-violet backdrop-blur-sm">
                  {task.user_state}
                </span>
              )}
              <span className="absolute left-1.5 top-1.5 flex gap-1">
                {task.engine_used && (
                  <span
                    className={cn(
                      "rounded bg-black/55 px-1.5 py-0.5 font-mono text-[8px] uppercase backdrop-blur-sm",
                      task.engine_used === "neural" ? "text-h3d-violet" : "text-h3d-gold",
                    )}
                  >
                    {task.engine_used}
                  </span>
                )}
                {task.confirmed && (
                  <span className="rounded bg-black/55 px-1.5 py-0.5 font-mono text-[8px] text-white/60 backdrop-blur-sm">
                    1 cr
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
