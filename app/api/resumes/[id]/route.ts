import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

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

    // Get resume to verify ownership and get storage path
    const { data: existing } = await supabase
        .from("resumes")
        .select("user_id, storage_path")
        .eq("id", id)
        .single();

    if (!existing || existing.user_id !== user.id) {
        return NextResponse.json(
            { error: "Not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    // Delete from Storage
    await supabase.storage.from("resumes").remove([existing.storage_path]);

    // Delete metadata from DB
    const { error } = await supabase.from("resumes").delete().eq("id", id);

    if (error) {
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
