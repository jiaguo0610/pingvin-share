import { Text, TextInput, createStyles } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import shareService from "../../services/share.service";
import toast from "../../utils/toast.util";

const useStyles = createStyles((theme) => ({
  input: {
    width: 130,
    [theme.fn.largerThan("sm")]: {
      width: 150,
    },
    "& input": {
      height: 32,
      borderRadius: theme.radius.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: 42,
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors[theme.primaryColor][0],
      border: "1px solid transparent",
      "&:focus, &:focus-within": {
        borderColor: "transparent",
      },
    },
  },
  action: {
    cursor: "pointer",
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    paddingRight: 10,
    userSelect: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    "&:hover": {
      opacity: 0.6,
    },
  },
}));

const ALLOWED_RE = /[^a-zA-Z0-9_-]/g;

const PickupCodeInput = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (router.pathname !== "/upload") return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [router.pathname]);

  const handleChange = (raw: string) => {
    setValue(raw.replace(ALLOWED_RE, ""));
  };

  const submit = async () => {
    const code = value.trim();
    if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) return;

    try {
      await shareService.getMetaData(code);
      setValue("");
      router.push(`/share/${encodeURIComponent(code)}`);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        toast.error("取件码无效");
      } else {
        setValue("");
        router.push(`/share/${encodeURIComponent(code)}`);
      }
    }
  };

  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChange={(e) => handleChange(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
      }}
      placeholder="取件码"
      size="xs"
      radius="sm"
      className={classes.input}
      rightSection={
        <Text className={classes.action} onClick={submit}>
          取件
        </Text>
      }
      aria-label="取件码"
    />
  );
};

export default PickupCodeInput;
