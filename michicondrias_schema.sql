--
-- PostgreSQL database dump
--

\restrict eAJXTImh8SUVfUrCN6EaQXfaABZymA4mcoy2YmBWlPzsn4CEWNb8oE16oa6mwq2

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO "user";

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adoption_listings; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.adoption_listings (
    name character varying(100) NOT NULL,
    species character varying(50) NOT NULL,
    breed character varying(100),
    age_months integer,
    size character varying(50),
    description text,
    photo_url text,
    published_by character varying(36) NOT NULL,
    is_approved boolean,
    status character varying(50),
    adopted_by character varying(36),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.adoption_listings OWNER TO "user";

--
-- Name: adoption_requests; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.adoption_requests (
    listing_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    applicant_name character varying(255),
    status character varying(50),
    house_type character varying(100),
    has_yard boolean,
    own_or_rent character varying(50),
    landlord_permission boolean,
    other_pets text,
    has_children boolean,
    children_ages character varying(100),
    hours_alone integer,
    financial_commitment boolean,
    reason text,
    previous_experience text,
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.adoption_requests OWNER TO "user";

--
-- Name: alembic_version_adopciones; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_adopciones (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_adopciones OWNER TO "user";

--
-- Name: alembic_version_carnet; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_carnet (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_carnet OWNER TO "user";

--
-- Name: alembic_version_core; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_core (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_core OWNER TO "user";

--
-- Name: alembic_version_directorio; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_directorio (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_directorio OWNER TO "user";

--
-- Name: alembic_version_ecommerce; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_ecommerce (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_ecommerce OWNER TO "user";

--
-- Name: alembic_version_mascotas; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.alembic_version_mascotas (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version_mascotas OWNER TO "user";

--
-- Name: clinics; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.clinics (
    name character varying(150) NOT NULL,
    address character varying(255),
    city character varying(100),
    state character varying(100),
    phone character varying(50),
    email character varying(150),
    website character varying(255),
    description text,
    is_24_hours boolean,
    has_emergency boolean,
    owner_user_id character varying(36),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.clinics OWNER TO "user";

--
-- Name: donations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.donations (
    id character varying NOT NULL,
    user_id character varying,
    amount double precision NOT NULL,
    currency character varying,
    message text,
    date timestamp with time zone DEFAULT now(),
    status character varying
);


ALTER TABLE public.donations OWNER TO "user";

--
-- Name: lost_pet_reports; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.lost_pet_reports (
    id character varying NOT NULL,
    reporter_id character varying NOT NULL,
    pet_name character varying(120) NOT NULL,
    species character varying(50) NOT NULL,
    breed character varying(100),
    color character varying(80),
    size character varying(30),
    age_approx character varying(50),
    description text,
    image_url text,
    report_type character varying(20) DEFAULT 'lost'::character varying,
    last_seen_location character varying(255),
    latitude double precision,
    longitude double precision,
    contact_phone character varying(30),
    contact_email character varying(120),
    status character varying(20) DEFAULT 'active'::character varying,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lost_pet_reports OWNER TO "user";

--
-- Name: lost_pets; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.lost_pets (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    pet_name character varying NOT NULL,
    species character varying NOT NULL,
    breed character varying,
    description text,
    last_seen_location character varying NOT NULL,
    date_lost timestamp with time zone NOT NULL,
    contact_phone character varying NOT NULL,
    image_url character varying,
    is_found boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lost_pets OWNER TO "user";

--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.medical_records (
    id character varying NOT NULL,
    pet_id character varying NOT NULL,
    veterinarian_id character varying,
    clinic_id character varying,
    date timestamp with time zone DEFAULT now(),
    reason_for_visit character varying NOT NULL,
    diagnosis text,
    treatment text,
    weight_kg double precision,
    notes text
);


ALTER TABLE public.medical_records OWNER TO "user";

--
-- Name: petfriendly_places; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.petfriendly_places (
    id character varying NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    description text,
    address character varying NOT NULL,
    city character varying,
    state character varying,
    latitude double precision,
    longitude double precision,
    rating double precision,
    image_url character varying,
    created_by_user_id character varying NOT NULL
);


ALTER TABLE public.petfriendly_places OWNER TO "user";

--
-- Name: pets; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.pets (
    name character varying(100) NOT NULL,
    species character varying(50) NOT NULL,
    breed character varying(100),
    age_months integer,
    size character varying(50),
    description text,
    status character varying(50),
    photo_url text,
    clinic_id character varying(36),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    adopted_from_listing_id character varying(36),
    owner_id character varying(36),
    is_active boolean DEFAULT true
);


ALTER TABLE public.pets OWNER TO "user";

--
-- Name: products; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.products (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    price double precision NOT NULL,
    stock integer,
    category character varying,
    image_url character varying,
    is_active boolean,
    seller_id character varying(255)
);


ALTER TABLE public.products OWNER TO "user";

--
-- Name: roles; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.roles (
    name character varying(50) NOT NULL,
    description character varying(255),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.roles OWNER TO "user";

--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255),
    is_active boolean,
    role_id character varying(36),
    verification_status character varying(50),
    id_front_url character varying(512),
    id_back_url character varying(512),
    proof_of_address_url character varying(512),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: vaccines; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.vaccines (
    id character varying NOT NULL,
    pet_id character varying NOT NULL,
    name character varying NOT NULL,
    date_administered timestamp with time zone DEFAULT now(),
    next_due_date timestamp with time zone,
    administered_by_vet_id character varying,
    batch_number character varying,
    notes text
);


ALTER TABLE public.vaccines OWNER TO "user";

--
-- Name: veterinarians; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.veterinarians (
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    specialty character varying(150),
    license_number character varying(100),
    phone character varying(50),
    email character varying(150),
    bio text,
    user_id character varying(36),
    clinic_id character varying(36),
    id character varying(36) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.veterinarians OWNER TO "user";

--
-- Name: adoption_listings adoption_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.adoption_listings
    ADD CONSTRAINT adoption_listings_pkey PRIMARY KEY (id);


--
-- Name: adoption_requests adoption_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.adoption_requests
    ADD CONSTRAINT adoption_requests_pkey PRIMARY KEY (id);


--
-- Name: alembic_version_adopciones alembic_version_adopciones_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_adopciones
    ADD CONSTRAINT alembic_version_adopciones_pkc PRIMARY KEY (version_num);


--
-- Name: alembic_version_carnet alembic_version_carnet_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_carnet
    ADD CONSTRAINT alembic_version_carnet_pkc PRIMARY KEY (version_num);


--
-- Name: alembic_version_core alembic_version_core_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_core
    ADD CONSTRAINT alembic_version_core_pkc PRIMARY KEY (version_num);


--
-- Name: alembic_version_directorio alembic_version_directorio_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_directorio
    ADD CONSTRAINT alembic_version_directorio_pkc PRIMARY KEY (version_num);


--
-- Name: alembic_version_ecommerce alembic_version_ecommerce_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_ecommerce
    ADD CONSTRAINT alembic_version_ecommerce_pkc PRIMARY KEY (version_num);


--
-- Name: alembic_version_mascotas alembic_version_mascotas_pkc; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.alembic_version_mascotas
    ADD CONSTRAINT alembic_version_mascotas_pkc PRIMARY KEY (version_num);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: lost_pet_reports lost_pet_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.lost_pet_reports
    ADD CONSTRAINT lost_pet_reports_pkey PRIMARY KEY (id);


--
-- Name: lost_pets lost_pets_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.lost_pets
    ADD CONSTRAINT lost_pets_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: petfriendly_places petfriendly_places_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.petfriendly_places
    ADD CONSTRAINT petfriendly_places_pkey PRIMARY KEY (id);


--
-- Name: pets pets_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.pets
    ADD CONSTRAINT pets_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vaccines vaccines_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.vaccines
    ADD CONSTRAINT vaccines_pkey PRIMARY KEY (id);


--
-- Name: veterinarians veterinarians_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_pkey PRIMARY KEY (id);


--
-- Name: ix_adoption_listings_published_by; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_adoption_listings_published_by ON public.adoption_listings USING btree (published_by);


--
-- Name: ix_adoption_requests_listing_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_adoption_requests_listing_id ON public.adoption_requests USING btree (listing_id);


--
-- Name: ix_adoption_requests_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_adoption_requests_user_id ON public.adoption_requests USING btree (user_id);


--
-- Name: ix_clinics_owner_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_clinics_owner_user_id ON public.clinics USING btree (owner_user_id);


--
-- Name: ix_donations_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_donations_id ON public.donations USING btree (id);


--
-- Name: ix_donations_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_donations_user_id ON public.donations USING btree (user_id);


--
-- Name: ix_lost_pets_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_lost_pets_id ON public.lost_pets USING btree (id);


--
-- Name: ix_lost_pets_pet_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_lost_pets_pet_name ON public.lost_pets USING btree (pet_name);


--
-- Name: ix_lost_pets_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_lost_pets_user_id ON public.lost_pets USING btree (user_id);


--
-- Name: ix_medical_records_clinic_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_medical_records_clinic_id ON public.medical_records USING btree (clinic_id);


--
-- Name: ix_medical_records_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_medical_records_id ON public.medical_records USING btree (id);


--
-- Name: ix_medical_records_pet_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_medical_records_pet_id ON public.medical_records USING btree (pet_id);


--
-- Name: ix_medical_records_veterinarian_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_medical_records_veterinarian_id ON public.medical_records USING btree (veterinarian_id);


--
-- Name: ix_petfriendly_places_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_petfriendly_places_category ON public.petfriendly_places USING btree (category);


--
-- Name: ix_petfriendly_places_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_petfriendly_places_id ON public.petfriendly_places USING btree (id);


--
-- Name: ix_petfriendly_places_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_petfriendly_places_name ON public.petfriendly_places USING btree (name);


--
-- Name: ix_pets_clinic_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_pets_clinic_id ON public.pets USING btree (clinic_id);


--
-- Name: ix_pets_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_pets_name ON public.pets USING btree (name);


--
-- Name: ix_pets_owner_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_pets_owner_id ON public.pets USING btree (owner_id);


--
-- Name: ix_products_category; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_products_category ON public.products USING btree (category);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_products_name ON public.products USING btree (name);


--
-- Name: ix_roles_name; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX ix_roles_name ON public.roles USING btree (name);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_full_name; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_users_full_name ON public.users USING btree (full_name);


--
-- Name: ix_vaccines_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_vaccines_id ON public.vaccines USING btree (id);


--
-- Name: ix_vaccines_pet_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_vaccines_pet_id ON public.vaccines USING btree (pet_id);


--
-- Name: ix_veterinarians_user_id; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX ix_veterinarians_user_id ON public.veterinarians USING btree (user_id);


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: veterinarians veterinarians_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.veterinarians
    ADD CONSTRAINT veterinarians_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict eAJXTImh8SUVfUrCN6EaQXfaABZymA4mcoy2YmBWlPzsn4CEWNb8oE16oa6mwq2

