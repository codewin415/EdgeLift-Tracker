import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const statusNode = document.getElementById("resetPasswordStatus");
const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("resetPasswordInput");

const supabaseUrl = window.EDGELIFT_SUPABASE_URL || "";
const supabaseAnonKey = window.EDGELIFT_SUPABASE_ANON_KEY || "";

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("error", isError);
}

if (!supabaseUrl || !supabaseAnonKey) {
  setStatus("Supabase is not configured for this deployment.", true);
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      setStatus("Reset session confirmed. Choose your new password.");
    } else {
      setStatus("Open this page from the password reset email link.", true);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = passwordInput.value;
    if (!password) {
      setStatus("Enter a new password.", true);
      return;
    }
    setStatus("Updating password...");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus(error.message, true);
      return;
    }
    setStatus("Password updated. You can return to the tracker and sign in.");
    form.reset();
  });
}
