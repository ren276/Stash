import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadResumeSchema, MAX_FILE_SIZE, ALLOWED_FILE_TYPE } from "@/lib/validations/resume";

export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json(
            { error: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from("resumes")
        .select("id, user_id, label, role_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const label = formData.get("label") as string;
    const role_type = formData.get("role_type") as string;

    // Validate metadata
    const result = uploadResumeSchema.safeParse({ label, role_type });
    if (!result.success) {
        return NextResponse.json(
            {
                error: result.error.issues[0]?.message || "Validation failed",
                code: "VALIDATION_ERROR",
            },
            { status: 400 }
        );
    }

    // Validate file
    if (!file) {
        return NextResponse.json(
            { error: "File is required", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    if (file.type !== ALLOWED_FILE_TYPE) {
        return NextResponse.json(
            { error: "Only PDF files are allowed", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { error: "File must be under 5MB", code: "VALIDATION_ERROR" },
            { status: 400 }
        );
    }

    const supabase = createServiceClient();
    const fileId = crypto.randomUUID();
    const storagePath = `${user.id}/${fileId}.pdf`;

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, fileBuffer, {
            contentType: "application/pdf",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json(
            { error: "Failed to upload file: " + uploadError.message, code: "STORAGE_ERROR" },
            { status: 500 }
        );
    }

    // Insert metadata
    const { data, error } = await supabase
        .from("resumes")
        .insert({
            user_id: user.id,
            label: result.data.label,
            role_type: result.data.role_type || null,
            storage_path: storagePath,
        })
        .select("id, user_id, label, role_type, created_at")
        .single();

    if (error) {
        // Cleanup uploaded file
        await supabase.storage.from("resumes").remove([storagePath]);
        return NextResponse.json(
            { error: error.message, code: "DB_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ data }, { status: 201 });
}
