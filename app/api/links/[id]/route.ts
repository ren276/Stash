import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { updateLinkSchema } from "@/lib/validations/link";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateLinkSchema.safeParse(body);

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

    // Verify ownership
    const { data: existing } = await supabase
        .from("links")
        .select("user_id")
        .eq("id", id)
        .single();

    if (!existing || existing.user_id !== user.id) {
        return NextResponse.json(
            { error: "Not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    const { data, error } = await supabase
        .from("links")
        .update(result.data)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ data });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Verify ownership
    const { data: existing } = await supabase
        .from("links")
        .select("user_id")
        .eq("id", id)
        .single();

    if (!existing || existing.user_id !== user.id) {
        return NextResponse.json(
            { error: "Not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) {
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
