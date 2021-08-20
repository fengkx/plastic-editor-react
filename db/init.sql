create table page_metas (
                            id bigserial primary key,
                            page_id text unique,
                            owner_id uuid not null default auth.uid(),
                            is_public boolean default false,
                            is_writable boolean default false
);

create table page_content (
                              id bigserial primary key,
                              page_id text unique,
                              content jsonb not null
);

create table blocks (
                        id bigserial primary key,
                        owner_id uuid not null default auth.uid(),
                        block_id text unique,
                        content jsonb not null
);


create table stars (
                       id bigserial primary key,
                       owner_id uuid,
                       content jsonb not null
);

alter table page_metas enable row level security;
CREATE POLICY "create_only_self" ON public.page_metas WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "update_only_self" ON public.page_metas USING (auth.uid() = owner_id);
CREATE POLICY "del_ony_self" ON public.page_metas USING (auth.uid() = owner_id);
CREATE POLICY "read_public" ON public.page_metas USING (true);

alter table page_content enable row level security;
CREATE POLICY "read_only_self_or_public" ON public.page_content USING (
    EXISTS (
            SELECT
                1
            FROM
                page_metas
            WHERE
                (
                        (page_metas.page_id = page_content.page_id)
                        AND (
                                (page_metas.owner_id = auth.uid())
                                OR (page_metas.is_public = true)
                            )
                    )
        )
    );
CREATE POLICY "create_only_self_or_writable" ON public.page_content WITH CHECK (
    EXISTS (
            SELECT
                1
            FROM
                page_metas
            WHERE
                (
                        (page_metas.page_id = page_content.page_id)
                        AND (
                                (page_metas.owner_id = auth.uid())
                                OR (
                                        (page_metas.is_public = true)
                                        AND (page_metas.is_writable = true)
                                    )
                            )
                    )
        )
    );
CREATE POLICY "update_only_self_wriable" ON public.page_content USING (
    EXISTS (
            SELECT
                1
            FROM
                page_metas
            WHERE
                (
                        (page_metas.page_id = page_content.page_id)
                        AND (
                                (page_metas.owner_id = auth.uid())
                                OR (
                                        (page_metas.is_public = true)
                                        AND (page_metas.is_writable = true)
                                    )
                            )
                    )
        )
    );
CREATE POLICY "del_only_self_or_writable" ON public.page_content USING (
    EXISTS (
            SELECT
                1
            FROM
                page_metas
            WHERE
                (
                        (page_metas.page_id = page_content.page_id)
                        AND (
                                (page_metas.owner_id = auth.uid())
                                OR (
                                        (page_metas.is_public = true)
                                        AND (page_metas.is_writable = true)
                                    )
                            )
                    )
        )
    );


alter table stars alter column owner_id set default auth.uid();
alter table stars enable row level security;
CREATE POLICY "all_only_self" ON public.stars USING (auth.uid() = owner_id);
