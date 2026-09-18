import { Box, Group, TextInput, createStyles } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { TbAlertTriangle } from "react-icons/tb";
import shareService from "../../services/share.service";

const useStyles = createStyles((theme) => ({
  wrapper: {
    marginRight: theme.spacing.sm,
  },
  input: {
    width: 110,
    [theme.fn.largerThan("sm")]: {
      width: 110,
    },
    "& input": {
      height: 30,
      borderRadius: theme.radius.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
      backgroundColor: "#f7f7ee",
      border: "none",
      boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.13)",
      fontSize: theme.fontSizes.sm,
      "&:focus, &:focus-within": {
        borderColor: "transparent",
      },
    },
  },
  action: {
    cursor: "pointer",
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    padding: "4px 12px",
    whiteSpace: "nowrap",
    userSelect: "none",
    height: 30,
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.sm,
    backgroundColor: "#e2e1f1",
    color: "#463fa8",
    "&:hover": {
      backgroundColor: "#d4d3eb",
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

  const showError = () => {
    showNotification({
      icon: <TbAlertTriangle size={20} />,
      color: "red",
      radius: "md",
      styles: {
        root: {
          backgroundColor: "#dddddd",
        },
        title: {
          color: "red",
          fontSize: 18,
          fontWeight: 700,
        },
        description: {
          color: "#c0392b",
          fontSize: 15,
        },
      },
      title: "取件码无效",
      message: "请检查后重新输入",
      autoClose: 3000,
    });
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
        showError();
      } else {
        setValue("");
        router.push(`/share/${encodeURIComponent(code)}`);
      }
    }
  };

  return (
    <Group spacing={4} className={classes.wrapper} noWrap>
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
        aria-label="取件码"
      />
      <Box component="span" className={classes.action} onClick={submit}>
        取件
      </Box>
    </Group>
  );
};

export default PickupCodeInput;
