"use client";

import { Button } from "@/components/ui/button";
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
import { useTransferOwnership } from "@/features/workspaces/hooks";
import { TransferOwnershipDialogProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  newOwnerId: z.string().uuid("Please select a valid member"),
});

type Values = z.infer<typeof schema>;

export function TransferOwnershipDialog({
  slug,
  members,
  currentUserId,
  open,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const transferOwnership = useTransferOwnership(slug);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { newOwnerId: "" },
  });

  const candidates = members.filter(
    (member) => member.user.id !== currentUserId,
  );

  useEffect(() => {
    if (open) form.reset({ newOwnerId: "" });
  }, [open, form]);

  const onSubmit = (values: Values) => {
    transferOwnership.mutate(values.newOwnerId, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer ownership</DialogTitle>
          <DialogDescription>
            Choose a member to become the new workspace owner. You will remain
            in this workspace as a Member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newOwnerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New owner</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={transferOwnership.isPending}>
                {transferOwnership.isPending
                  ? "Transferring..."
                  : "Transfer ownership"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
