import {
  Group,
  Text,
  TextInput,
  createStyles,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    marginRight: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    whiteSpace: "nowrap",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
  },
  input: {
    width: 170,
    "& input": {
      height: 36,
      borderRadius: theme.radius.md,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors[theme.primaryColor][0],
      border: "1px solid transparent",
      "&::placeholder": {
        color:
          theme.colorScheme === "dark"
            ? theme.colors.dark[3]
            : theme.colors.gray[5],
      },
      "&:focus, &:focus-within": {
        borderColor: theme.colors[theme.primaryColor][5],
      },
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

  const submit = () => {
    const code = value.trim();
    if (!code || !/^[a-zA-Z0-9_-]+$/.test(code)) return;
    router.push(`/share/${encodeURIComponent(code)}`);
  };

  return (
    <Group spacing={6} noWrap className={classes.wrapper}>
      <Text className={classes.label}>取件：</Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => handleChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="取件码"
        size="xs"
        radius="md"
        className={classes.input}
        aria-label="取件码"
      />
    </Group>
  );
};

export default PickupCodeInput;
