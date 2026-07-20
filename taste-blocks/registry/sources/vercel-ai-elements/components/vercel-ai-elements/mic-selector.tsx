"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const deviceIdRegex = /\(([\da-fA-F]{4}:[\da-fA-F]{4})\)$/;

interface MicSelectorContextType {
  data: MediaDeviceInfo[];
  value: string | undefined;
  onValueChange?: (value: string) => void;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  width: number;
  setWidth?: (width: number) => void;
}

const MicSelectorContext = createContext<MicSelectorContextType>({
  data: [],
  onOpenChange: undefined,
  onValueChange: undefined,
  open: false,
  setWidth: undefined,
  value: undefined,
  width: 200,
});

export const useAudioDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const loadDevicesWithoutPermission = useCallback(async () => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) {
      setDevices([]);
      setError("Audio devices are unavailable in this browser");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const deviceList = await mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(
        (device) => device.kind === "audioinput"
      );

      setDevices(audioInputs);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to get audio devices";

      setError(message);
      console.error("Error getting audio devices:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDevicesWithPermission = useCallback(async () => {
    if (loading) {
      return;
    }

    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) {
      setDevices([]);
      setError("Audio devices are unavailable in this browser");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tempStream = await mediaDevices.getUserMedia({
        audio: true,
      });

      for (const track of tempStream.getTracks()) {
        track.stop();
      }

      const deviceList = await mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(
        (device) => device.kind === "audioinput"
      );

      setDevices(audioInputs);
      setHasPermission(true);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to get audio devices";

      setError(message);
      console.error("Error getting audio devices:", message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadDevicesWithoutPermission();
  }, [loadDevicesWithoutPermission]);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices) {
      return;
    }

    const handleDeviceChange = () => {
      if (hasPermission) {
        loadDevicesWithPermission();
      } else {
        loadDevicesWithoutPermission();
      }
    };

    mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [hasPermission, loadDevicesWithPermission, loadDevicesWithoutPermission]);

  return {
    devices,
    error,
    hasPermission,
    loadDevices: loadDevicesWithPermission,
    loading,
  };
};

export type MicSelectorProps = ComponentProps<typeof Popover> & {
  defaultValue?: string;
  value?: string | undefined;
  onValueChange?: (value: string | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const MicSelector = ({
  defaultValue,
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: MicSelectorProps) => {
  const [value, onValueChange] = useControllableState<string | undefined>({
    defaultProp: defaultValue,
    onChange: controlledOnValueChange,
    prop: controlledValue,
  });
  const [open, onOpenChange] = useControllableState({
    defaultProp: defaultOpen,
    onChange: controlledOnOpenChange,
    prop: controlledOpen,
  });
  const [width, setWidth] = useState(200);
  const { devices, loading, hasPermission, loadDevices } = useAudioDevices();

  useEffect(() => {
    if (open && !hasPermission && !loading) {
      loadDevices();
    }
  }, [open, hasPermission, loading, loadDevices]);

  const contextValue = useMemo(
    () => ({
      data: devices,
      onOpenChange,
      onValueChange,
      open,
      setWidth,
      value,
      width,
    }),
    [devices, onOpenChange, onValueChange, open, setWidth, value, width]
  );

  return (
    <MicSelectorContext.Provider value={contextValue}>
      <Popover {...props} onOpenChange={onOpenChange} open={open} />
    </MicSelectorContext.Provider>
  );
};

export type MicSelectorTriggerProps = ComponentProps<typeof Button>;

export const MicSelectorTrigger = ({
  children,
  ...props
}: MicSelectorTriggerProps) => {
  const { setWidth } = useContext(MicSelectorContext);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Create a ResizeObserver to detect width changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = (entry.target as HTMLElement).offsetWidth;
        if (newWidth) {
          setWidth?.(newWidth);
        }
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    // Clean up the observer when component unmounts
    return () => {
      resizeObserver.disconnect();
    };
  }, [setWidth]);

  return (
    <PopoverTrigger asChild>
      <Button variant="outline" {...props} ref={ref}>
        {children}
        <ChevronsUpDownIcon
          className="shrink-0 text-muted-foreground"
          size={16}
        />
      </Button>
    </PopoverTrigger>
  );
};

export type MicSelectorContentProps = ComponentProps<typeof Command> & {
  popoverOptions?: ComponentProps<typeof PopoverContent>;
};

export const MicSelectorContent = ({
  className,
  popoverOptions,
  ...props
}: MicSelectorContentProps) => {
  const { width, onValueChange, value } = useContext(MicSelectorContext);

  return (
    <PopoverContent
      className={cn("p-0", className)}
      style={{ width }}
      {...popoverOptions}
    >
      <Command onValueChange={onValueChange} value={value} {...props} />
    </PopoverContent>
  );
};

export type MicSelectorInputProps = ComponentProps<typeof CommandInput> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export const MicSelectorInput = ({ ...props }: MicSelectorInputProps) => (
  <CommandInput placeholder="Search microphones..." {...props} />
);

export type MicSelectorListProps = Omit<
  ComponentProps<typeof CommandList>,
  "children"
> & {
  children: (devices: MediaDeviceInfo[]) => ReactNode;
};

export const MicSelectorList = ({
  children,
  ...props
}: MicSelectorListProps) => {
  const { data } = useContext(MicSelectorContext);

  return <CommandList {...props}>{children(data)}</CommandList>;
};

export type MicSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const MicSelectorEmpty = ({
  children = "No microphone found.",
  ...props
}: MicSelectorEmptyProps) => <CommandEmpty {...props}>{children}</CommandEmpty>;

export type MicSelectorItemProps = ComponentProps<typeof CommandItem>;

export const MicSelectorItem = (props: MicSelectorItemProps) => {
  const { onValueChange, onOpenChange } = useContext(MicSelectorContext);

  const handleSelect = useCallback(
    (currentValue: string) => {
      onValueChange?.(currentValue);
      onOpenChange?.(false);
    },
    [onValueChange, onOpenChange]
  );

  return <CommandItem onSelect={handleSelect} {...props} />;
};

export type MicSelectorLabelProps = ComponentProps<"span"> & {
  device: MediaDeviceInfo;
};

export const MicSelectorLabel = ({
  device,
  className,
  ...props
}: MicSelectorLabelProps) => {
  const matches = device.label.match(deviceIdRegex);

  if (!matches) {
    return (
      <span className={className} {...props}>
        {device.label}
      </span>
    );
  }

  const [, deviceId] = matches;
  const name = device.label.replace(deviceIdRegex, "");

  return (
    <span className={className} {...props}>
      <span>{name}</span>
      <span className="text-muted-foreground"> ({deviceId})</span>
    </span>
  );
};

export type MicSelectorValueProps = ComponentProps<"span">;

export const MicSelectorValue = ({
  className,
  ...props
}: MicSelectorValueProps) => {
  const { data, value } = useContext(MicSelectorContext);
  const currentDevice = data.find((d) => d.deviceId === value);

  if (!currentDevice) {
    return (
      <span className={cn("flex-1 text-start", className)} {...props}>
        Select microphone...
      </span>
    );
  }

  return (
    <MicSelectorLabel
      className={cn("flex-1 text-start", className)}
      device={currentDevice}
      {...props}
    />
  );
};
