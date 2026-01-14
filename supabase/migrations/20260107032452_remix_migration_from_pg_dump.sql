CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: access_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.access_level AS ENUM (
    'public',
    'authenticated',
    'restricted'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'researcher',
    'student'
);


--
-- Name: research_label; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.research_label AS ENUM (
    'practical_research',
    'capstone',
    'thesis',
    'dissertation',
    'other'
);


--
-- Name: research_strand; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.research_strand AS ENUM (
    'STEM',
    'HUMSS',
    'ABM',
    'ICT',
    'GAS',
    'Other'
);


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(_user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    research_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    link text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    bio text,
    affiliation text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: qa_answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: qa_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    research_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: qa_upvotes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qa_upvotes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    question_id uuid,
    answer_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT upvote_target CHECK ((((question_id IS NOT NULL) AND (answer_id IS NULL)) OR ((question_id IS NULL) AND (answer_id IS NOT NULL))))
);


--
-- Name: researches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.researches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    abstract text NOT NULL,
    keywords text[] DEFAULT '{}'::text[] NOT NULL,
    author_id uuid NOT NULL,
    file_url text,
    file_name text,
    views integer DEFAULT 0 NOT NULL,
    academic_year text,
    strand public.research_strand DEFAULT 'Other'::public.research_strand,
    label public.research_label DEFAULT 'other'::public.research_label,
    access_level public.access_level DEFAULT 'public'::public.access_level NOT NULL,
    abstract_visible boolean DEFAULT true NOT NULL,
    citation_apa text,
    citation_mla text,
    is_archived boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: search_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    query text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: bookmarks bookmarks_user_id_research_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_research_id_key UNIQUE (user_id, research_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: qa_answers qa_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_pkey PRIMARY KEY (id);


--
-- Name: qa_questions qa_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_pkey PRIMARY KEY (id);


--
-- Name: qa_upvotes qa_upvotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_pkey PRIMARY KEY (id);


--
-- Name: qa_upvotes qa_upvotes_user_id_answer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_user_id_answer_id_key UNIQUE (user_id, answer_id);


--
-- Name: qa_upvotes qa_upvotes_user_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_user_id_question_id_key UNIQUE (user_id, question_id);


--
-- Name: researches researches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.researches
    ADD CONSTRAINT researches_pkey PRIMARY KEY (id);


--
-- Name: search_history search_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: qa_answers update_qa_answers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_qa_answers_updated_at BEFORE UPDATE ON public.qa_answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: qa_questions update_qa_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_qa_questions_updated_at BEFORE UPDATE ON public.qa_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: researches update_researches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_researches_updated_at BEFORE UPDATE ON public.researches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookmarks bookmarks_research_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_research_id_fkey FOREIGN KEY (research_id) REFERENCES public.researches(id) ON DELETE CASCADE;


--
-- Name: bookmarks bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: qa_answers qa_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.qa_questions(id) ON DELETE CASCADE;


--
-- Name: qa_answers qa_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_answers
    ADD CONSTRAINT qa_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: qa_questions qa_questions_research_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_research_id_fkey FOREIGN KEY (research_id) REFERENCES public.researches(id) ON DELETE CASCADE;


--
-- Name: qa_questions qa_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_questions
    ADD CONSTRAINT qa_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: qa_upvotes qa_upvotes_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.qa_answers(id) ON DELETE CASCADE;


--
-- Name: qa_upvotes qa_upvotes_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.qa_questions(id) ON DELETE CASCADE;


--
-- Name: qa_upvotes qa_upvotes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qa_upvotes
    ADD CONSTRAINT qa_upvotes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: researches researches_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.researches
    ADD CONSTRAINT researches_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: search_history search_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_history
    ADD CONSTRAINT search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: qa_answers Admins can delete answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete answers" ON public.qa_answers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: qa_questions Admins can delete questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete questions" ON public.qa_questions FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: qa_answers Answers viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Answers viewable by authenticated users" ON public.qa_answers FOR SELECT USING (((auth.uid() IS NOT NULL) AND (is_deleted = false)));


--
-- Name: qa_answers Authenticated users can create answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create answers" ON public.qa_answers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: qa_questions Authenticated users can create questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create questions" ON public.qa_questions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: researches Authors and admins can delete researches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors and admins can delete researches" ON public.researches FOR DELETE USING (((auth.uid() = author_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: researches Authors and admins can update researches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors and admins can update researches" ON public.researches FOR UPDATE USING (((auth.uid() = author_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: researches Public researches viewable by all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public researches viewable by all" ON public.researches FOR SELECT USING (((access_level = 'public'::public.access_level) OR ((access_level = 'authenticated'::public.access_level) AND (auth.uid() IS NOT NULL)) OR (author_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: qa_questions Questions viewable by authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Questions viewable by authenticated users" ON public.qa_questions FOR SELECT USING (((auth.uid() IS NOT NULL) AND (is_deleted = false)));


--
-- Name: researches Students can insert researches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can insert researches" ON public.researches FOR INSERT WITH CHECK (((auth.uid() = author_id) AND (public.has_role(auth.uid(), 'student'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))));


--
-- Name: notifications System can insert notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: qa_upvotes Upvotes viewable by all authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Upvotes viewable by all authenticated" ON public.qa_upvotes FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: bookmarks Users can create bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: qa_upvotes Users can create upvotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create upvotes" ON public.qa_upvotes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: bookmarks Users can delete own bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: search_history Users can delete own search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own search history" ON public.search_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: qa_upvotes Users can delete own upvotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own upvotes" ON public.qa_upvotes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_roles Users can insert own role on signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: search_history Users can insert search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert search history" ON public.search_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: qa_answers Users can update own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own answers" ON public.qa_answers FOR UPDATE USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: qa_questions Users can update own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own questions" ON public.qa_questions FOR UPDATE USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: bookmarks Users can view own bookmarks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: search_history Users can view own search history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bookmarks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: qa_answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.qa_answers ENABLE ROW LEVEL SECURITY;

--
-- Name: qa_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.qa_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: qa_upvotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.qa_upvotes ENABLE ROW LEVEL SECURITY;

--
-- Name: researches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.researches ENABLE ROW LEVEL SECURITY;

--
-- Name: search_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;