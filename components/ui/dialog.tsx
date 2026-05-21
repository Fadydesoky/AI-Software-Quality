"use client"

import * as React from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface DialogContextType {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(open)
  const isControlled = onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function DialogTrigger({
  children,
  asChild,
}: DialogTriggerProps) {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("DialogTrigger must be used within Dialog")
  }

  const handleClick = () => {
    context.onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    })
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  onEscapeKeyDown?: (e: KeyboardEvent) => void
}

export function DialogContent({
  children,
  className,
  onEscapeKeyDown,
  ...props
}: DialogContentProps) {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("DialogContent must be used within Dialog")
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeKeyDown?.(e)
        context.onOpenChange(false)
      }
    }

    if (context.isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [context.isOpen, onEscapeKeyDown, context])

  if (!context.isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => context.onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2",
          "rounded-lg border border-border/50 bg-card shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DialogHeader({ children, className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 border-b border-border/50 px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DialogFooter({ children, className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn("flex justify-end gap-2 border-t border-border/50 px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

export function DialogDescription({
  children,
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}
