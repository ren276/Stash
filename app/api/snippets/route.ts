import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { createSnippetSchema } from "@/lib/validations/snippet";

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const supabase = createServiceClient();
    let query = supabase
        .from("snippets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (search) {
        query = query.or(
            `title.ilike.%${search}%,body.ilike.%${search}%`
        );
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    const body = await request.json();
    const result = createSnippetSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            {
                error: result.error.issues[0]?.message || "Validation failed",
                code: "VALIDATION_ERROR",
            },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from("snippets")
        .insert({ ...result.data, user_id: user.id })
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ data }, { status: 201 });
}
