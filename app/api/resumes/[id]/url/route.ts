import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
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
    const { data: resume } = await supabase
        .from("resumes")
        .select("user_id, storage_path")
        .eq("id", id)
        .single();

    if (!resume || resume.user_id !== user.id) {
        return NextResponse.json(
            { error: "Not found", code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    // Generate signed URL (1 hour)
    const { data: signedUrlData, error } = await supabase.storage
        .from("resumes")
        .createSignedUrl(resume.storage_path, 3600);

    if (error || !signedUrlData) {
        return NextResponse.json(
            { error: "Failed to generate URL", code: "STORAGE_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        url: signedUrlData.signedUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
}
