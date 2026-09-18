import { TextInput, createStyles } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { TbAlertTriangle } from "react-icons/tb";
import shareService from "../../services/share.service";

const useStyles = createStyles((theme) => ({
  input: {
    width: 130,
    [theme.fn.largerThan("sm")]: {
      width: 130,
    },
    "& input": {
      height: 30,
      borderRadius: theme.radius.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: 0,
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors[theme.primaryColor][0],
      border: "1px solid transparent",
      fontSize: theme.fontSizes.sm,
      "&:focus, &:focus-within": {
        borderColor: "transparent",
      },
    },
  },
  action: {
    cursor: "pointer",
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
    padding: "0 10px",
    whiteSpace: "nowrap",
    userSelect: "none",
    height: 30,
    display: "flex",
    alignItems: "center",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.white,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors[theme.primaryColor][7],
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[1],
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
      rightSectionWidth="auto"
      rightSection={
        <span className={classes.action} onClick={submit}>
          取件
        </span>
      }
      aria-label="取件码"
    />
  );
};

export default PickupCodeInput;
