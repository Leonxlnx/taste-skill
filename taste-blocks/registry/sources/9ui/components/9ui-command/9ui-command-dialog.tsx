"use client"

import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { cn } from "../../lib/utils"

function Dialog({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
	return <BaseDialog.Root data-slot="dialog" {...props} />
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof BaseDialog.Portal>) {
	return <BaseDialog.Portal data-slot="dialog-portal" {...props} />
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof BaseDialog.Trigger>) {
	return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose({
	...props
}: React.ComponentProps<typeof BaseDialog.Close>) {
	return <BaseDialog.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Backdrop>) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 bg-black/50 transition-all duration-200 [&[data-ending-style]]:opacity-0 [&[data-starting-style]]:opacity-0",
				className
			)}
			{...props}
		/>
	)
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
	showCloseButton?: boolean
}) {
	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<BaseDialog.Popup
				data-slot="dialog-content"
				className={cn(
					"bg-popover text-popover-foreground fixed top-[100vh] left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-full gap-4 rounded-lg border p-6 shadow-lg transition-all duration-200 outline-none data-ending-style:translate-y-full data-ending-style:opacity-0 data-starting-style:translate-y-full data-starting-style:opacity-0 max-sm:rounded-b-none sm:top-[50%] sm:w-[32rem] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:scale-[calc(1-0.1*var(--nested-dialogs))] data-ending-style:sm:translate-y-[-50%] data-ending-style:sm:scale-95 data-starting-style:sm:translate-y-[-50%] data-starting-style:sm:scale-95",
					className
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogClose className="ring-offset-popover focus:ring-ring text-muted-foreground absolute top-4 end-4 rounded-xs opacity-50 transition-opacity hover:opacity-100 focus:ring-[3px] focus:ring-offset-2 focus:outline-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
						<XIcon />
						<span className="sr-only">Close</span>
					</DialogClose>
				)}
			</BaseDialog.Popup>
		</DialogPortal>
	)
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-start", className)}
			{...props}
		/>
	)
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			{...props}
		/>
	)
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Title>) {
	return (
		<BaseDialog.Title
			data-slot="dialog-title"
			className={cn("text-lg leading-none font-semibold", className)}
			{...props}
		/>
	)
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof BaseDialog.Description>) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
}
