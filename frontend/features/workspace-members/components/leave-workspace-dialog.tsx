import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LeaveWorkspaceDialogProps } from "@/types";
import { useLeaveWorkspace } from "@/features/workspaces/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Values = {
  newOwnerId?: string;
};

export function LeaveWorkspaceDialog({
  slug,
  members,
  currentUserId,
  isOwner,
  open,
  onOpenChange,
}: LeaveWorkspaceDialogProps) {
  const router = useRouter();
  const leaveWorkspace = useLeaveWorkspace(slug);

  const schema = useMemo(
    () =>
      z
        .object({
          newOwnerId: z.string().optional(),
        })
        .superRefine((values, ctx) => {
          if (isOwner && !values.newOwnerId) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["newOwnerId"],
              message: "Please select a new owner",
            });
          }

          if (
            values.newOwnerId &&
            !z.string().uuid().safeParse(values.newOwnerId).success
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["newOwnerId"],
              message: "Please select a valid member",
            });
          }
        }),
    [isOwner],
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newOwnerId: "" },
  });

  const candidates = members.filter(
    (member) => member.user.id !== currentUserId,
  );

  useEffect(() => {
    if (open) {
      form.reset({ newOwnerId: "" });
    }
  }, [open, form]);

  const onSubmit = (values: Values) => {
    leaveWorkspace.mutate(isOwner ? values.newOwnerId : undefined, {
      onSuccess: () => {
        onOpenChange(false);
        router.push("/workspaces");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave workspace</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "You must transfer ownership to another member before leaving this workspace."
              : "Are you sure you want to leave this workspace? You will lose access to its projects and tasks."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isOwner && (
              <FormField
                control={form.control}
                name="newOwnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New owner</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={candidates.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidates.map((member) => (
                          <SelectItem key={member.id} value={member.user.id}>
                            {member.user.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {candidates.length === 0 && (
                      <FormDescription>
                        No other members are available to receive ownership.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="destructive"
                disabled={
                  leaveWorkspace.isPending ||
                  (isOwner && candidates.length === 0)
                }
              >
                {leaveWorkspace.isPending ? "Leaving..." : "Leave workspace"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
