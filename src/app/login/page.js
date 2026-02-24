"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function loginpage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);}