"use client"

import * as React from "react"
import { Command as CommandBase } from "cmdk-base"
import { SearchIcon } from "lucide-react"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./9ui-command-dialog"

import { cn } from "../../lib/utils"

function Command({
	className,
	...props
}: React.ComponentProps<typeof CommandBase>) {
	return (
		<CommandBase
			data-slot="command"
			className={cn(
				"bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md border outline-none",
				className
			)}
			{...props}
		/>
	)
}

function CommandDialog({
	title = "Command Palette",
	description = "Search for a command to run...",
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string
	description?: string
	className?: string
	showCloseButton?: boolean
	children?: React.ReactNode
}) {
	return (
		<Dialog {...props}>
			<DialogHeader className="sr-only">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn("overflow-hidden p-0", className)}
				showCloseButton={showCloseButton}
			>
				<Command>{children}</Command>
			</DialogContent>
		</Dialog>
	)
}

function CommandInput({
	className,
	disabled,
	...props
}: React.ComponentProps<typeof CommandBase.Input>) {
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex h-9 items-center gap-2 border-b px-3"
		>
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandBase.Input
				data-slot="command-input"
				className={cn(
					"placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50",
					className
				)}
				data-disabled={disabled}
				disabled={disabled}
				{...props}
			/>
		</div>
	)
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandBase.List>) {
	return (
		<CommandBase.List
			data-slot="command-list"
			className={cn(
				"max-h-[300px] overflow-x-hidden overflow-y-auto outline-hidden",
				className
			)}
			{...props}
		/>
	)
}

function CommandEmpty({
	...props
}: React.ComponentProps<typeof CommandBase.Empty>) {
	return (
		<CommandBase.Empty
			data-slot="command-empty"
			className="py-6 text-center text-sm"
			{...props}
		/>
	)
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandBase.Group>) {
	return (
		<CommandBase.Group
			data-slot="command-group"
			className={cn(
				"text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
				className
			)}
			{...props}
		/>
	)
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandBase.Separator>) {
	return (
		<CommandBase.Separator
			data-slot="command-separator"
			className={cn("bg-border -mx-1 h-px", className)}
			{...props}
		/>
	)
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandBase.Item>) {
	return (
		<CommandBase.Item
			data-slot="command-item"
			className={cn(
				"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		/>
	)
}

function CommandShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="command-shortcut"
			className={cn(
				"text-muted-foreground ms-auto flex items-center gap-1 text-xs tracking-widest",
				className
			)}
			{...props}
		/>
	)
}

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
}
