import { Box, createStyles } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useRouter } from "next/router";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { TbAlertTriangle } from "react-icons/tb";
import shareService from "../../services/share.service";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "stretch",
    border: "1px solid #e2e1f1",
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    width: "fit-content",
    marginRight: theme.spacing.sm,
  },
  input: {
    height: 29,
    width: 80,
    [theme.fn.largerThan("sm")]: {
      width: 80,
    },
    border: "none",
    outline: "none",
    padding: "0 10px",
    backgroundColor: "#f7f7ee",
    boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.13)",
    fontSize: theme.fontSizes.sm,
    borderRadius: 0,
    "&::placeholder": {
      color: theme.colors.gray[5],
    },
  },
  action: {
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    backgroundColor: "#e2e1f1",
    color: "#463fa8",
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    userSelect: "none",
    borderRadius: 0,
    "&:hover": {
      backgroundColor: "#d4d3eb",
    },
  },
  shake: {
    animation: "pickupFlash 0.8s ease-in-out 2",
  },
  "@keyframes pickupFlash": {
    "0%, 100%": {
      backgroundColor: "#f7f7ee",
    },
    "50%": {
      backgroundColor: "#ffcccc",
    },
  },
}));

const ALLOWED_RE = /[^a-zA-Z0-9_-]/g;

const PickupCodeInput = () => {
  const { classes, cx } = useStyles();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (router.pathname !== "/upload") return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [router.pathname]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value.replace(ALLOWED_RE, ""));
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

  const flashEmpty = () => {
    setFlashing(true);
    inputRef.current?.focus();
    window.setTimeout(() => setFlashing(false), 1800);
  };

  const submit = async () => {
    const code = value.trim();
    if (!code) {
      flashEmpty();
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(code)) return;

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
    <Box className={classes.wrapper}>
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="取件码"
        className={cx(classes.input, flashing && classes.shake)}
        aria-label="取件码"
      />
      <Box component="span" className={classes.action} onClick={submit}>
        取件
      </Box>
    </Box>
  );
};

export default PickupCodeInput;
